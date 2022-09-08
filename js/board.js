const create = document.getElementById("");
const table = document.getElementById("table");
const writer = "all";

$.ajax({
  url: "/board",
  type: "post",
  data: { writer },
  success: (datas) => {
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");
    const columns = ["postId", "title", "writer", "createdAt"];
    datas.forEach((data, idx) => {
      const tr = document.createElement("tr");
      columns.forEach((column) => {
        const value = data[column];
        const td = document.createElement("td");
        td.setAttribute("postId", data["postId"]); 
        if (column === "postId") {
          td.innerHTML = idx+1;
        } else {
          td.innerHTML = value;
        }
        tr.appendChild(td);
      });

      tr.addEventListener("click", (e) => {
        const postId = e.target.getAttribute("postId");
        console.log(postId);
        document.location.href = `/board/${postId}`;
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    console.log(document.querySelectorAll("tr").length )
    if(document.querySelectorAll("tr").length >= 10){
        for(let i=10;i <= document.querySelectorAll("tr").length;i++){
          console.log(i)
          document.querySelectorAll("tr")[i].style.display = "none"
        }
    }
  },
});
