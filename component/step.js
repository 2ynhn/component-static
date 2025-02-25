const renderStep = (props) => {
    stepHtml = `
        <link rel="stylesheet" href="${props.css}">
        <div class="step">
            <p>Your State is...</p>
            <div class="bar">
                <span class="current">${props.current}</span>
                <span class="total">${props.total}</span>
            </div>
        </div>
    `;

    const current = document.querySelector('.current');
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('current')) {
            console.log('Current step:', props.current);
        }       
    });
    return stepHtml;
};

return renderStep(props);