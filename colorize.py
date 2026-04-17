import numpy as np
import cv2
import os
import urllib.request

# --------Model file URLs and paths--------#
model_dir = 'Model'
proto_file = os.path.join(model_dir, 'colorization_deploy_v2.prototxt')
model_file = os.path.join(model_dir, 'colorization_release_v2.caffemodel')
hull_pts = os.path.join(model_dir, 'pts_in_hull.npy')

# URLs to download the required Caffe models and points
urls = {
    proto_file: 'https://raw.githubusercontent.com/richzhang/colorization/master/models/colorization_deploy_v2.prototxt',
    model_file: 'https://huggingface.co/akhaliq/colorizer/resolve/main/colorization_release_v2.caffemodel', # HuggingFace is more stable than original source
    hull_pts: 'https://github.com/richzhang/colorization/raw/master/resources/pts_in_hull.npy'
}

def download_file(url, filepath):
    if not os.path.exists(filepath):
        print(f"Downloading {filepath}...")
        try:
            # Adding headers as some servers block default python user agents
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response:
                with open(filepath, 'wb') as f:
                    f.write(response.read())
            print(f"Successfully downloaded {filepath}")
        except Exception as e:
            print(f"Failed to download {url}: {e}")
            return False
    return True

# Ensure model directory exists
if not os.path.exists(model_dir):
    os.makedirs(model_dir)

# Download all necessary files
print("Checking and downloading model files if necessary...")
all_downloaded = True
for filepath, url in urls.items():
    if not download_file(url, filepath):
        all_downloaded = False

if not all_downloaded:
    print("Error downloading one or more required files. Please check your internet connection or download them manually.")
    exit(1)

# --------Reading the model params--------#
print("Loading model parameters...")
try:
    net = cv2.dnn.readNetFromCaffe(proto_file, model_file)
    kernel = np.load(hull_pts)
except Exception as e:
    print(f"Error loading model parameters: {e}")
    exit(1)
#-----------------------------------#---------------------#

#-----Reading and preprocessing image--------#
img_path = 'images/img1.jpg' 

# Create images folder if not exists
if not os.path.exists('images'):
    os.makedirs('images')

# Check if image exists
if not os.path.exists(img_path):
    print(f"\n[!] Error: {img_path} not found.")
    print("Please place a black and white image named 'img1.jpg' in the 'images' directory.")
    print("Example: C:\\Users\\ASUS\\.gemini\\antigravity\\scratch\\images\\img1.jpg")
    exit(1)

print(f"Processing image: {img_path}")
img = cv2.imread(img_path)
scaled = img.astype("float32") / 255.0

lab_img = cv2.cvtColor(scaled, cv2.COLOR_BGR2LAB)
#-----------------------------------#---------------------#

# add the cluster centers as 1x1 convolutions to the model
class8 = net.getLayerId("class8_ab")
conv8 = net.getLayerId("conv8_313_rh")

pts = kernel.transpose().reshape(2, 313, 1, 1)

net.getLayer(class8).blobs = [pts.astype("float32")]
net.getLayer(conv8).blobs = [np.full([1, 313], 2.606, dtype="float32")]
#-----------------------------------#---------------------#

# we'll resize the image for the network
resized = cv2.resize(lab_img, (224, 224))

# split the L channel
L = cv2.split(resized)[0]

# mean subtraction
L -= 50
#-----------------------------------#---------------------#

# predicting the ab channels from the input L channel
print("Colorizing image...")
net.setInput(cv2.dnn.blobFromImage(L))

ab_channel = net.forward()[0, :, :, :].transpose((1, 2, 0))

# resize the predicted 'ab' volume to the same dimensions as our input image
ab_channel = cv2.resize(ab_channel, (img.shape[1], img.shape[0]))

# Take the L channel from the image
L = cv2.split(lab_img)[0]

# Join the L channel with predicted ab channel
colorized = np.concatenate((L[:, :, np.newaxis], ab_channel), axis=2)

# Then convert the image from Lab to BGR
colorized = cv2.cvtColor(colorized, cv2.COLOR_LAB2BGR)
colorized = np.clip(colorized, 0, 1)

# change the image to 0-255 range and convert it from float32 to int
colorized = (255 * colorized).astype("uint8")

# Let's resize the images and show them together
img_resized = cv2.resize(img,(640,640))
colorized_resized = cv2.resize(colorized,(640,640))

result = cv2.hconcat([img_resized, colorized_resized])

print("Processing complete! Showing result.")
cv2.imwrite("colorized_result.jpg", colorized)
# Removed imshow and waitKey as it blocks remote execution
cv2.destroyAllWindows()
