// controllers/pages.controller.js
exports.renderView = (viewName) => {
    return (req, res) => {
        const isLogged = req.session?.loggedin || false;
        const name = req.session?.name || '';
        res.render(viewName, { login: isLogged, name });
    };
};
