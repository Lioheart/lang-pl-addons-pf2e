export function toggleJournalStyle(enabled) {
    const styleId = "journal-style";
    let existingStyle = document.getElementById(styleId);

    if (enabled) {
        if (!existingStyle) {
            const link = document.createElement("link");
            link.id = styleId;
            link.rel = "stylesheet";
            link.href = "modules/lang-pl-addons-pf2e/styles/journals.css";
            document.head.appendChild(link);
        }
    } else {
        if (existingStyle) {
            existingStyle.remove();
        }
    }
}
