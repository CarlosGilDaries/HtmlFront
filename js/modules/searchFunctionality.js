import { renderContents } from "./renderContents.js";

export function search(allContents, currentContents, renderContainerId, searchTerm) {
    return function (event) {
        searchTerm = event.target.value.toLowerCase();
        currentContents = allContents.filter(content =>
            content.title.toLowerCase().includes(searchTerm)
        );
        renderContents(filteredContents, renderContainerId);
    };
}