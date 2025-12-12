// Profile header upload
const headerUpload = document.getElementById("header-upload");
const headerImage = document.getElementById("header-image");
const headerVideo = document.getElementById("header-video");

headerUpload.addEventListener("change", (e)=>{
  const file = e.target.files[0];
  if(!file) return;
  if(file.type.startsWith("video/")){
    headerVideo.src = URL.createObjectURL(file);
    headerVideo.style.display = "block";
    headerImage.style.display = "none";
  } else if(file.type.startsWith("image/")){
    headerImage.src = URL.createObjectURL(file);
    headerImage.style.display = "block";
    headerVideo.style.display = "none";
  }
});

// Follow button
const followBtn = document.getElementById("follow-btn");
const followersCount = document.getElementById("followers-count");
let following = false;
let followers = 0;

followBtn.addEventListener("click", ()=>{
  following = !following;
  followBtn.textContent = following ? "Following" : "Follow";
  followers += following ? 1 : -1;
  followersCount.textContent = followers + " followers";
});

// Create posts
const postUpload = document.getElementById("post-upload");
const postCaption = document.getElementById("post-caption");
const postBtn = document.getElementById("post-btn");
const feedGrid = document.getElementById("feed-grid");

postBtn.addEventListener("click", ()=>{
  const files = postUpload.files;
  if(!files.length) return alert("Select at least one image/video");
  
  Array.from(files).forEach(file=>{
    const post = document.createElement("div");
    post.className = "post";

    let media;
    if(file.type.startsWith("image/")){
      media = document.createElement("img");
      media.src = URL.createObjectURL(file);
    } else if(file.type.startsWith("video/")){
      media = document.createElement("video");
      media.src = URL.createObjectURL(file);
      media.controls = true;
    }
    post.appendChild(media);

    if(postCaption.value){
      const caption = document.createElement("p");
      caption.textContent = postCaption.value;
      post.appendChild(caption);
    }

    const likeBtn = document.createElement("button");
    likeBtn.textContent = "Like";
    let liked = false;
    likeBtn.addEventListener("click", ()=>{
      liked = !liked;
      likeBtn.textContent = liked ? "Liked" : "Like";
    });
    post.appendChild(likeBtn);

    feedGrid.prepend(post);
  });

  postUpload.value = "";
  postCaption.value = "";
});
