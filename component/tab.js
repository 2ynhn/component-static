const renderTabs = (props) => {
    const tabsHtml = `
        <div class="tab-container">
            <div class="tab-buttons">
                ${props.tabs.map((tab, index) => `
                    <button class="tab-btn" data-tab="${index}">${tab}</button>
                `).join("")}
            </div>
            <div class="tab-contents">
                ${props.tabs.map((tab, index) => `
                    <div class="tab-content" id="tab-${index}" style="display: ${index === 0 ? 'block' : 'none'};">
                        ${tab} 내용
                    </div>
                `).join("")}
            </div>
        </div>
    `;

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('tab-btn')) {
            // Add event listeners to tab buttons
            const button = e.target;
            const tabContents = document.querySelectorAll('.tab-content');
            console.log('Tab clicked:', button.textContent);
            const tabIndex = button.getAttribute('data-tab');

            // Hide all tab contents
            tabContents.forEach(content => {
                content.style.display = 'none';
            });

            // Show the selected tab content
            const selectedContent = document.querySelector(`#tab-${tabIndex}`);
            selectedContent.style.display = 'block';
        }       
    });

    return tabsHtml;
};

return renderTabs(props);