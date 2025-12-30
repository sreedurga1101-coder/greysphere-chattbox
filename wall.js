// store like counts
let likeCounts = {};
function loadLikes() {
  fetch("/react/counts")
    .then(res => res.json())
    .then(data => {
      likeCounts = {};
      data.forEach(r => {
        likeCounts[r.post_id] = r.likes;
      });
    });
}

function loadWall() {
  fetch("/wall/list")
    .then(res => res.json())
    .then(data => {

      const { posts, replies } = data;
      document.getElementById("wall").innerHTML = "";

      posts.forEach(post => {

        // collect replies for this post
        const postReplies = replies.filter(
          r => r.post_id === post.entry_id
        );

        const replyHTML = postReplies.map(r => `
          <div class="reply-box">
            <strong>${r.display_name}</strong>
            <div>${r.reply_text}</div>
            <small>${new Date(r.created_at).toLocaleString()}</small>
          </div>
        `).join("");

        document.getElementById("wall").innerHTML += `
          <div class="post-card ${isRecent(post.created_at) ? "new" : ""}">

            <div class="d-flex justify-content-between">
              <strong>${post.display_name}</strong>
              <small>${new Date(post.created_at).toLocaleString()}</small>
            </div>

            <p>${post.message}</p>

${post.image ? `
  <img
    src="${post.image}"
    class="post-image"
    alt="post image">
` : ""}


<div class="d-flex gap-2 mb-2 align-items-center">

  <!-- LIKE BUTTON -->
  <button
    class="like-btn"
    onclick="likePost(${post.entry_id}, this)">
    ❤️ <span>${likeCounts[post.entry_id] || 0}</span>
  </button>

  <!-- DELETE -->
  <form method="POST" action="/wall/delete">
    <input type="hidden" name="post_id" value="${post.entry_id}">
    <button class="btn btn-sm btn-danger">Delete</button>
  </form>

  <!-- EDIT -->
  <button
    class="btn btn-sm btn-secondary"
    onclick="editPostPrompt(${post.entry_id}, '${post.message.replace(/'/g, "\\'")}')">
    Edit
  </button>

</div>


${replyHTML}

<form method="POST" action="/wall/reply">

  <input type="hidden" name="post_id" value="${post.entry_id}">

  <div class="d-flex gap-2">
    <input
      name="reply_text"
      class="form-control form-control-sm"
      placeholder="Write a reply..."
      required>

    <button type="submit" class="btn btn-sm btn-primary">
      Reply
    </button>
  </div>
</form>



          </div>
        `;
      });
    });
}




function isRecent(time) {
  return (Date.now() - new Date(time)) < 60000;
}
function editPostPrompt(postId, oldMessage) {
  const updated = prompt("Edit your post:", oldMessage);
  if (!updated) return;

  const form = document.createElement("form");
  form.method = "POST";
  form.action = "/wall/edit";

  form.innerHTML = `
    <input type="hidden" name="post_id" value="${postId}">
    <input type="hidden" name="message" value="${updated}">
  `;

  document.body.appendChild(form);
  form.submit();
}
function likePost(postId, btn) {
  fetch("/react/like", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ post_id: postId })
  })
  .then(res => res.json())
  .then(() => {
    loadLikes();
    setTimeout(loadWall, 200);
  });
}
loadLikes();
loadWall();

