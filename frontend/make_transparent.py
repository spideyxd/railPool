import os
from PIL import Image

def process_image(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()
    
    threshold = 240
    newData = []
    for item in datas:
        if item[0] >= threshold and item[1] >= threshold and item[2] >= threshold:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)
            
    img.putdata(newData)
    
    # Scale down a bit keeping ratio for better web optimization
    base_width = 400
    wpercent = (base_width / float(img.size[0]))
    hsize = int((float(img.size[1]) * float(wpercent)))
    img = img.resize((base_width, hsize), Image.LANCZOS)
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, "PNG")

files = [
    (r"C:\Users\123\.gemini\antigravity\brain\fc248c89-3664-430e-83df-fae163965f0b\frame_1_train_1775325316768.png", "public/story_frames/frame1.png"),
    (r"C:\Users\123\.gemini\antigravity\brain\fc248c89-3664-430e-83df-fae163965f0b\frame_2_angry_1775325330927.png", "public/story_frames/frame2.png"),
    (r"C:\Users\123\.gemini\antigravity\brain\fc248c89-3664-430e-83df-fae163965f0b\frame_3_happy_1775325346368.png", "public/story_frames/frame3.png"),
    (r"C:\Users\123\.gemini\antigravity\brain\fc248c89-3664-430e-83df-fae163965f0b\frame_4_riding_1775325363440.png", "public/story_frames/frame4.png")
]

for in_p, out_p in files:
    try:
        process_image(in_p, out_p)
        print(f"Processed {out_p}")
    except Exception as e:
        print(f"Failed {out_p}: {e}")
