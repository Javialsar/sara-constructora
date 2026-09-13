from PIL import Image

def get_dominant_colors(image_path):
    # Open the image
    img = Image.open(image_path).convert('RGB')
    
    # Define bounding boxes for the 3 color blocks (left, middle, right)
    width, height = img.size
    
    # Left block
    left_box = (int(width * 0.15), int(height * 0.5))
    left_color = img.getpixel(left_box)
    
    # Middle block
    middle_box = (int(width * 0.5), int(height * 0.5))
    middle_color = img.getpixel(middle_box)
    
    # Right block
    right_box = (int(width * 0.85), int(height * 0.5))
    right_color = img.getpixel(right_box)
    
    def rgb2hex(r,g,b):
        return "#{:02x}{:02x}{:02x}".format(r,g,b).upper()

    print(f"Left Color: {rgb2hex(*left_color)}")
    print(f"Middle Color: {rgb2hex(*middle_color)}")
    print(f"Right Color: {rgb2hex(*right_color)}")

get_dominant_colors("C:/Users/elkin/.gemini/antigravity/brain/d65b0a43-c04e-474d-9351-405b1f72f677/.user_uploaded/media_1789268191203.png")
