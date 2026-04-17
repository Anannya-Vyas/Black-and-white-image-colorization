import numpy as np
import cv2
import os
import urllib.request

class ImageColorizer:
    def __init__(self, model_dir='Model'):
        self.model_dir = model_dir
        self.prototxt = os.path.join(model_dir, "colorization_deploy_v2.prototxt")
        self.caffemodel = os.path.join(model_dir, "colorization_release_v2.caffemodel")
        self.pts_in_hull = os.path.join(model_dir, "pts_in_hull.npy")
        
        # OpenVINO mirrors (usually fast and reliable)
        self.urls = {
            self.prototxt: "https://storage.openvinotoolkit.org/repositories/datumaro/models/colorization/colorization_deploy_v2.prototxt",
            self.caffemodel: "https://storage.openvinotoolkit.org/repositories/datumaro/models/colorization/colorization_release_v2.caffemodel",
            self.pts_in_hull: "https://storage.openvinotoolkit.org/repositories/datumaro/models/colorization/pts_in_hull.npy"
        }
        
        self.net = None
        self.pts = None
        
        if not os.path.exists(self.model_dir):
            os.makedirs(self.model_dir)

    def _download_file(self, url, filepath):
        if not os.path.exists(filepath):
            print(f"Downloading {os.path.basename(filepath)}...")
            try:
                # Use a standard user agent to avoid being blocked
                req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req) as response:
                    with open(filepath, 'wb') as f:
                        f.write(response.read())
                print(f"Downloaded {os.path.basename(filepath)}")
                return True
            except Exception as e:
                print(f"Error downloading {url}: {e}")
                return False
        return True

    def ensure_models(self):
        all_ok = True
        for filepath, url in self.urls.items():
            if not self._download_file(url, filepath):
                all_ok = False
        return all_ok

    def load_model(self):
        if not self.ensure_models():
            raise Exception("Failed to download model files.")
            
        print("Loading model...")
        self.net = cv2.dnn.readNetFromCaffe(self.prototxt, self.caffemodel)
        self.pts = np.load(self.pts_in_hull)

        # Add the cluster centers as 1x1 convolutions to the model
        class8 = self.net.getLayerId("class8_ab")
        conv8 = self.net.getLayerId("conv8_313_rh")
        pts = self.pts.transpose().reshape(2, 313, 1, 1)
        self.net.getLayer(class8).blobs = [pts.astype("float32")]
        self.net.getLayer(conv8).blobs = [np.full([1, 313], 2.606, dtype="float32")]
        print("Model loaded successfully.")

    def colorize(self, img_bytes):
        if self.net is None:
            self.load_model()
            
        # Convert bytes to numpy array
        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise ValueError("Could not decode image.")

        # Preprocessing
        scaled = img.astype("float32") / 255.0
        lab = cv2.cvtColor(scaled, cv2.COLOR_BGR2LAB)
        
        # Resize for the network
        resized = cv2.resize(lab, (224, 224))
        L = cv2.split(resized)[0]
        L -= 50 # mean subtraction

        # Prediction
        self.net.setInput(cv2.dnn.blobFromImage(L))
        ab = self.net.forward()[0, :, :, :].transpose((1, 2, 0))

        # Postprocessing
        ab = cv2.resize(ab, (img.shape[1], img.shape[0]))
        L = cv2.split(lab)[0]
        
        colorized = np.concatenate((L[:, :, np.newaxis], ab), axis=2)
        colorized = cv2.cvtColor(colorized, cv2.COLOR_LAB2BGR)
        colorized = np.clip(colorized, 0, 1)
        colorized = (255 * colorized).astype("uint8")
        
        # Encode back to bytes (JPEG)
        _, buffer = cv2.imencode('.jpg', colorized)
        return buffer.tobytes()
