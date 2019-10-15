const SameDataModel = require('../models/SameData');
const findtheSame = require('../compare/findtheSame')();

let saveSameData = () => {
    return new Promise( (resolve, reject) => {
        findtheSame.func(async function (ans) {
            let newContact = await SameDataModel.createNew(ans);
            resolve(newContact);
        });

    })
}
let getAllData = () => {
    return new Promise(async (resolve, reject) => {
            let newData = await SameDataModel.getAllSame();
            resolve(newData)

    })
}
let addNew = (name, level, attr, text) =>{
    return new Promise(async(resolve, reject)=>{
        let newSameData = {
            name: name,
            level : null,
            attr: attr,
            text: text
        }
        let newData = await SameDataModel.createNew(newSameData)
        resolve(newData)
    })
}
module.exports = {
    saveSameData: saveSameData,
    getAllData: getAllData,
    addNew : addNew
}