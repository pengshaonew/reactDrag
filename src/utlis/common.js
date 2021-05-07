
// 替换富文本中除了img标签外的所有标签
window.String.prototype.replaceDiv = function() {
    return this.replace(/<(?!<img[^>]*>)[^>]+>/g, function() {
        let val = arguments[0];
        if (/img/g.test(val)) {
            return val;
        } else {
            return '';
        }
    });
};