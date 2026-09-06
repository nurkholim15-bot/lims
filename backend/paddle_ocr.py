import sys
import os
import logging
from PIL import Image

# Disable verbose logging from Paddle to keep stdout clean
logging.getLogger("ppocr").setLevel(logging.ERROR)
os.environ["PPOCR_LOG_LEVEL"] = "ERROR"

try:
    from paddleocr import PaddleOCR
except ImportError as e:
    print(f"Error importing PaddleOCR: {e}", file=sys.stderr)
    sys.exit(1)

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 paddle_ocr.py <image_path> [code_min] [code_max] [skor_min] [skor_max]")
        sys.exit(1)

    img_path = sys.argv[1]
    if not os.path.exists(img_path):
        print(f"Error: File not found: {img_path}", file=sys.stderr)
        sys.exit(1)

    # Check if column coordinates are passed
    filter_cols = len(sys.argv) >= 6
    if filter_cols:
        try:
            code_min = float(sys.argv[2])
            code_max = float(sys.argv[3])
            skor_min = float(sys.argv[4])
            skor_max = float(sys.argv[5])
        except ValueError:
            filter_cols = False

    # Get image dimensions using PIL and resize if too large to speed up inference (avoid timeouts)
    img_width = 1000
    try:
        with Image.open(img_path) as img:
            img_width, img_height = img.size
            
            # Auto-compress image to reduce processing time if excessively large (max width 1200px)
            MAX_WIDTH = 1200
            if img_width > MAX_WIDTH:
                ratio = MAX_WIDTH / float(img_width)
                new_height = int(float(img_height) * float(ratio))
                img = img.resize((MAX_WIDTH, new_height), Image.Resampling.LANCZOS)
                img_width = MAX_WIDTH
                img.save(img_path)
    except Exception as e:
        print(f"Warning: Failed to process image width/resizing: {e}", file=sys.stderr)
        filter_cols = False
    # Suppress verbose C++ logs from paddle
    os.environ["GLOG_minloglevel"] = "2"

    # Redirect fd 1 (stdout) to a black hole to suppress C++ logs
    fd = sys.stdout.fileno()
    original_fd = os.dup(fd)
    devnull = os.open(os.devnull, os.O_WRONLY)
    os.dup2(devnull, fd)

    try:
        from paddleocr import PaddleOCR
        # enable_mkldnn=False avoids C++ crashes on VPS.
        # use_textline_orientation=False speeds up processing by 30% (assuming documents are mostly upright)
        ocr = PaddleOCR(use_textline_orientation=False, lang='id', enable_mkldnn=False)
        result = ocr.ocr(img_path)
    except Exception as e:
        os.dup2(original_fd, fd)
        print(f"Error running PaddleOCR: {e}", file=sys.stderr)
        sys.exit(1)
    finally:
        # Restore normal stdout fd
        os.dup2(original_fd, fd)
        os.close(original_fd)
        os.close(devnull)

    if not result or not result[0]:
        return

    # Extract box and text info depending on PaddleOCR version
    if isinstance(result[0], dict) and 'rec_texts' in result[0]:
        # New PaddleX v3/PP-OCRv6 format
        boxes_info = []
        page_data = result[0]
        polys = page_data.get('dt_polys', page_data.get('rec_polys', []))
        texts = page_data.get('rec_texts', [])
        scores = page_data.get('rec_scores', [])
        
        for i in range(len(texts)):
            try:
                # Convert numpy array to standard python lists of floats
                box = [[float(p[0]), float(p[1])] for p in polys[i]]
                text = texts[i]
                score = float(scores[i])
                boxes_info.append([box, (text, score)])
            except Exception:
                pass
    else:
        # Legacy PaddleOCR v2 format
        boxes_info = result[0]
    
    # Estimate average text tilt/slope using median to make grouping tilt-robust
    slopes = []
    for item in boxes_info:
        box = item[0]
        dx = box[1][0] - box[0][0]
        dy = box[1][1] - box[0][1]
        if dx > 15: # Use sufficiently wide boxes for stable slope estimation
            slopes.append(dy / dx)
            
    avg_slope = 0.0
    if slopes:
        slopes.sort()
        avg_slope = slopes[len(slopes) // 2] # Median slope
    # Dynamic header column detection (Code, Skor, Name)
    code_hdr = None
    skor_hdr = None
    name_hdr = None
    header_ymax = 0
    use_smart_header = False

    for item in boxes_info:
        box = item[0]
        text_clean = item[1][0].strip().lower()
        ymin = min(pt[1] for pt in box)
        ymax = max(pt[1] for pt in box)
        xmin = min(pt[0] for pt in box)
        xmax = max(pt[0] for pt in box)
        
        # Check top 35% of image for headers
        if ymin / img_height < 0.35:
            if any(k in text_clean for k in ['code', 'kode', 'parameter', 'param']):
                code_hdr = (xmin / img_width, xmax / img_width)
                header_ymax = max(header_ymax, ymax)
            elif any(k in text_clean for k in ['skor', 'score', 'nilai', 'hasil']):
                skor_hdr = (xmin / img_width, xmax / img_width)
                header_ymax = max(header_ymax, ymax)
            elif any(k in text_clean for k in ['name', 'nama', 'aspek', 'keterangan', 'uraian']):
                name_hdr = (xmin / img_width, xmax / img_width)
                header_ymax = max(header_ymax, ymax)

    if code_hdr and skor_hdr:
        use_smart_header = True
        filter_cols = True
        if skor_hdr[0] < (name_hdr[0] if name_hdr else 0.60):
            # Layout: [No] [Code] [:] [Skor] [Name] (Skor column is in the middle!)
            code_min = 0.0
            code_max = (code_hdr[1] + skor_hdr[0]) / 2.0
            skor_min = code_max
            skor_max = skor_hdr[1] + 0.02
        else:
            # Layout: [No] [Code] [Name] [Skor] (Skor column is at the far right!)
            code_min = 0.0
            code_max = code_hdr[1] + 0.10
            skor_min = skor_hdr[0] - 0.05
            skor_max = 1.0

    def extract_items(use_filter):
        extracted = []
        for item in boxes_info:
            box = item[0]
            text = item[1][0]
            conf = item[1][1]
            
            # Calculate bounding box coordinates
            ymin = min(pt[1] for pt in box)
            ymax = max(pt[1] for pt in box)
            xmin = min(pt[0] for pt in box)
            xmax = max(pt[0] for pt in box)
            height = ymax - ymin
            
            # Skip header row items when smart header is active
            if use_smart_header and ymax <= header_ymax + 5:
                continue

            # Skip standalone punctuation or bullet chars
            if text.strip() in [':', '.', '•', '••', '• •', '-']:
                continue

            # Project ymin using the average tilt slope to align tilted rows
            projected_ymin = ymin - xmin * avg_slope
            
            if use_filter:
                # Check horizontal position using center point
                x_center = (xmin + xmax) / (2.0 * img_width)
                in_code = (code_min <= x_center <= code_max)
                in_skor = (skor_min <= x_center <= skor_max)
                if not (in_code or in_skor):
                    continue
            
            extracted.append({
                'ymin': ymin,
                'ymax': ymax,
                'xmin': xmin,
                'xmax': xmax,
                'projected_ymin': projected_ymin,
                'height': height,
                'text': text,
                'conf': conf
            })
        return extracted

    items = extract_items(filter_cols)
    if filter_cols and (len(items) == 0 or not any(any(c.isdigit() for c in it['text']) for it in items)):
        # Fallback if filter dropped everything or dropped all digits
        items = extract_items(False)

    # Sort items vertically by projected_ymin
    items.sort(key=lambda x: x['projected_ymin'])

    # Group items into lines using projected_ymin
    grouped_lines = []
    for item in items:
        placed = False
        # Search for an existing group that is close vertically
        for group in grouped_lines:
            avg_proj_ymin = sum(b['projected_ymin'] for b in group) / len(group)
            avg_height = sum(b['height'] for b in group) / len(group)
            
            item_cy = item['projected_ymin'] + item['height'] / 2.0
            group_cy = avg_proj_ymin + avg_height / 2.0
            
            item_top = item['projected_ymin']
            item_bot = item['projected_ymin'] + item['height']
            group_top = min(b['projected_ymin'] for b in group)
            group_bot = max(b['projected_ymin'] + b['height'] for b in group)
            overlap = min(item_bot, group_bot) - max(item_top, group_top)
            
            cy_diff = abs(item_cy - group_cy)
            min_h = min(item['height'], avg_height)
            overlap_ratio = (overlap / float(min_h)) if min_h > 0 else 0.0
            
            # Belongs to the same line if vertical overlap is substantial (>=45%) 
            # OR vertical center difference is small (within 35% of text height)
            if (overlap > 0 and overlap_ratio >= 0.45) or (cy_diff <= min(avg_height * 0.35, 25.0)):
                group.append(item)
                placed = True
                break
        
        if not placed:
            grouped_lines.append([item])

    # Reconstruct text lines, ensuring horizontal layout and columns are preserved
    output_lines = []
    for group in grouped_lines:
        # Sort items horizontally in each line
        group.sort(key=lambda x: x['xmin'])
        
        line_str = ""
        prev_xmax = None
        
        for item in group:
            text = item['text']
            
            # Estimate character width
            if len(text) > 0:
                char_w = (item['xmax'] - item['xmin']) / len(text)
            else:
                char_w = 8.0
            
            if prev_xmax is not None:
                gap = item['xmin'] - prev_xmax
                if gap > 0:
                    # Calculate spaces to insert based on gap width
                    num_spaces = int(round(gap / char_w))
                    if num_spaces < 1:
                        num_spaces = 1
                    elif num_spaces > 3:
                        # For clear table columns, ensure at least 4 spaces
                        num_spaces = max(num_spaces, 4)
                    
                    line_str += " " * num_spaces
                else:
                    line_str += " "
            
            line_str += text
            prev_xmax = item['xmax']
            
        # Get average projected y-coordinate for the line to sort lines vertically at the end
        avg_proj_y = sum(b['projected_ymin'] for b in group) / len(group)
        output_lines.append((avg_proj_y, line_str))

    # Sort all lines from top to bottom by projected y
    output_lines.sort(key=lambda x: x[0])

    # Print the aligned lines
    for _, line_text in output_lines:
        print(line_text)

if __name__ == '__main__':
    main()
