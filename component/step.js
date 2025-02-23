const renderStep = (props) => {
    stepHtml = `
        <div class="step">
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