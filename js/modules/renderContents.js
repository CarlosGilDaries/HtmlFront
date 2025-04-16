export function renderContents(contents, id) {
  const container = document.getElementById(id);
  let containerTextContent = '';

  contents.forEach((content) => {
    containerTextContent += `   
                <div class="admin-card">
                    <h3>${content.title}</h3>
                    <form class="delete-form" data-id="${content.id}">
                        <input type="hidden" name="content_id" value="${content.id}">
                        <button type="submit" class="icon-button">
                            <i class="fas fa-trash"></i>
                        </button>
                    </form>
                </div>
            `;
  });

  container.innerHTML = containerTextContent;
}
