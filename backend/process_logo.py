import sys
from PIL import Image

def process_image(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    width, height = img.size
    
    # Crop bottom 32% to heavily avoid the RailPool text
    crop_height = int(height * 0.68)
    img = img.crop((0, 0, width, crop_height))
    width, height = img.size
    
    # Get background color from top-left corner
    bg_color = img.getpixel((0, 0))
    bg_r, bg_g, bg_b = bg_color[:3]
    
    # Make background transparent with anti-aliasing
    pixels = img.load()
    tolerance = 90
    
    min_x, max_x = width, 0
    min_y, max_y = height, 0

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            dist = abs(r - bg_r) + abs(g - bg_g) + abs(b - bg_b)
            
            if dist < 20:
                pixels[x, y] = (r, g, b, 0)
            elif dist < tolerance:
                # scale alpha smoothly
                alpha = int(((dist - 20) / (tolerance - 20)) * 255)
                # blend color back towards original using background difference
                pixels[x, y] = (r, g, b, alpha)
            else:
                if x < min_x: min_x = x
                if x > max_x: max_x = x
                if y < min_y: min_y = y
                if y > max_y: max_y = y

    # Crop tight with some padding
    pad = 10
    min_x = max(0, min_x - pad)
    max_x = min(width, max_x + pad)
    min_y = max(0, min_y - pad)
    max_y = min(height, max_y + pad)
    
    if min_x < max_x and min_y < max_y:
        img = img.crop((min_x, min_y, max_x, max_y))
        
    img.save(output_path, "PNG")
    print(f"Processed image and saved to {output_path}")

if __name__ == "__main__":
    process_image(sys.argv[1], sys.argv[2])
