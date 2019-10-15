const fs = require('fs');
const _ = require('lodash');
//Tạo folder 
module.exports.createFolder = (folderName, folderpath) => {
    let folder = folderName.split(".html");
    if (!fs.existsSync(`${folderpath}/${folder[0]}`)) {
        fs.mkdirSync(`${folderpath}/${folder[0]}`, { recursive: true });
    }
};
//Tìm trùng lặp
module.exports.findDuplicate = arr => {
    return arr.filter((value, index, arr) => arr.indexOf(value) === index);
}
//Tìm object trùng lặp
module.exports.findDupObject = (a) => {
    let arr = []
    for (let i = 0; i < a.length; i++) {
        for (let j = i + 1; j < a.length; j++) {
            if (_.isEqual(a[i], a[j])) arr.push(a[i])
        }
    }
    return arr
}
//Xoá obj trùng lặp
module.exports.removeDupObject = (a) => {
    var cleaned = [];
    a.forEach(function(itm) {
        var unique = true;
        cleaned.forEach(function(itm2) {
            if (_.isEqual(itm, itm2)) unique = false;
        });
        if (unique)  cleaned.push(itm);
    });
    return cleaned;
}