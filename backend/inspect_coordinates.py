import sys
import os
from PIL import Image
from paddleocr import PaddleOCR

def main():
    img_path = "scratch/masked_page-1.png"
    if not os.path.exists(img_path):
        import glob
        matches = glob.glob("scratch/masked_page-*.png")
        if matches:
            img_path = matches[0]
        else:
            print("No masked page image found in scratch.")
            sys.exit(1)

    print(f"Analyzing coordinates for: {img_path}")
    with Image.open(img_path) as img:
        width, height = img.size
    
    ocr = PaddleOCR(use_angle_cls=True, lang='id', show_log=False)
    result = ocr.ocr(img_path, cls=True)
    if not result or not result[0]:
        print("No OCR results.")
        return

    for item in result[0]:
        box = item[0]
        text = item[1][0]
        conf = item[1][1]
        xmin = min(pt[0] for pt in box)
        xmax = max(pt[0] for pt in box)
        x_min_ratio = xmin / width
        x_max_ratio = xmax / width
        print(f"Ratio: [{x_min_ratio:.3f} - {x_max_ratio:.3f}] | Conf: {conf:.2f} | Text: '{text}'")

if __name__ == '__main__':
    main()
