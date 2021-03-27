const html = document.documentElement;
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

const frameCount = 4;
const currentFrame = index => (
  `../img/Bild${index.toString()}.jpg`
)

window.addEventListener('resize', function(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    context.drawImage(img, 0, 0, canvas.width, canvas.height);
});

const preloadImages = () => {
  for (let i = 1; i < frameCount; i++) {
    const img = new Image();
    img.src = currentFrame(i);
  }
};

const img = new Image()
img.src = currentFrame(1);
canvas.width=window.innerWidth;
canvas.height=window.innerHeight;
img.onload=function(){
    context.drawImage(img, 0, 0, canvas.width, canvas.height);
}

const updateImage = index => {
  img.src = currentFrame(index);
  context.drawImage(img, 0, 0, canvas.width, canvas.height);
}

window.addEventListener('scroll', () => {  
  const scrollTop = html.scrollTop;
  const maxScrollTop = html.scrollHeight - window.innerHeight;
  const scrollFraction = scrollTop / maxScrollTop;
  const frameIndex = Math.min(
    frameCount - 1,
    Math.ceil(scrollFraction * frameCount)
  );
  requestAnimationFrame(() => updateImage(frameIndex + 1))
});

preloadImages()

