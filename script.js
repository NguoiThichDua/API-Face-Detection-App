const video = document.getElementById('video');

/* Gọi các API cần thiết vào (mới gọi thôi chưa sử dụng - sử dụng ở duói sự kiện play) */
Promise.all([
    /* Dò tìm khuôn mặt nhỏ */
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    /* Nhận diện được miệng - mắt - mũi */
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    /* Nhận diện được khung hộp cho khuôn mặt */
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    /* Phát hiện cảm xúc như cười - nhăn nhó - khóc - ... */
    faceapi.nets.faceExpressionNet.loadFromUri('/models'),
]).then(startVideo);

/* Mở webcam và hiển thị hình ảnh ra video */
function startVideo(){
    navigator.getUserMedia(
        { video : {} },
        stream => video.srcObject = stream,
        err => console.error(err)
    )
}

video.addEventListener('play', () => {
    /* Tạo canvas để hiển thị độ họa hình ảnh (vẽ khung - vẽ các điểm ảnh) */
    const canvas = faceapi.createCanvasFromMedia(video);
    /* Chèn canvas vào body bằng append */
    document.body.append(canvas);
    /* Hiển thị kích thước phù hợp dựa vào kích thước video */
    const displaySize = { width: video.width, height: video.height};
    faceapi.matchDimensions(canvas, displaySize);

    /* Sử lí đồng bộ */
    setInterval(async () => {
        /* detectAllDaces: Lấy được luôn tất cả các khuôn mặt được hiên thị từ webcam */
        /* withFaceExpressions: Phát hiện cảm xúc */
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
        console.log(detections);
        const resizeDetections = faceapi.resizeResults(detections, displaySize);
        /* Lấy bối ảnh 2d tức là ảnh 2 chiều - Xóa khung để cập nhật khung mới cũng như chiều cao và rộng*/
        canvas.getContext('2d').clearRect(0,0, canvas.width, canvas.height);

        /* Vẽ khung hiển thị khuông mặt */
        faceapi.draw.drawDetections(canvas, resizeDetections);
        /* Vẽ các chấm nhỏ trên khuôn mặt */
        // faceapi.draw.drawFaceLandmarks(canvas, resizeDetections);
        /* Hiển thị cảm xúc */
        faceapi.draw.drawFaceExpressions(canvas, resizeDetections);
    }, 100) /* Đồng bộ sao 100 mili giây */
});