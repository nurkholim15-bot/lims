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

    # Get image dimensions using PIL
    img_width = 1000
    if filter_cols:
        try:
            with Image.open(img_path) as img:
                img_width, _ = img.size
        except Exception as e:
            print(f"Warning: Failed to open image to get width: {e}", file=sys.stderr)
            filter_cols = False

    # Initialize PaddleOCR
    # lang='id' for Indonesian/English, use_textline_orientation=True and use_angle_cls=True to auto-rotate and orient text
    ocr = PaddleOCR(use_angle_cls=True, use_textline_orientation=True, lang='id', show_log=False)

    try:
        result = ocr.ocr(img_path, cls=True)
    except Exception as e:
        print(f"Error running PaddleOCR: {e}", file=sys.stderr)
        sys.exit(1)

    if not result or not result[0]:
        return

    # Extract box and text info
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
            
            # Project ymin using the average tilt slope to align tilted rows
            projected_ymin = ymin - xmin * avg_slope
            
            if use_filter:
                # Check horizontal range overlap with the code or score columns
                x_min_ratio = xmin / img_width
                x_max_ratio = xmax / img_width
                overlaps_code = (x_min_ratio <= code_max) and (x_max_ratio >= code_min)
                overlaps_skor = (x_min_ratio <= skor_max) and (x_max_ratio >= skor_min)
                if not (overlaps_code or overlaps_skor):
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
    if filter_cols and len(items) == 0:
        # Fallback for camera photos/scans where coordinates don't align to standard ratios
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
            
            # Use dynamic threshold based on box height (around 90% of text height)
            threshold = avg_height * 0.90
            if threshold < 12:
                threshold = 12
            elif threshold > 32:
                threshold = 32
                
            if abs(item['projected_ymin'] - avg_proj_ymin) < threshold:
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
