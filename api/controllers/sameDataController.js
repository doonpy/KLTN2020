const fimtheSame = require('../../core/compareHTML/findtheSame')();
const sameDataService = require('../services/sameDataService')
let getAllData = async (req, res, next) => {
  try {
    // let sameData = await sameDataService.saveSameData();

    // return res.status(200).send({ success: !!sameData })
    let sameData = await sameDataService.getAllData();
    return res.status(200).json(sameData)
  }
  catch (error) {
    return res.status(500).send(error)
  }
};
let sameData = async(req, res) => {
  let same = req.body.same;
  let dataObj = new Object
  same.forEach(value=>{
    dataObj = {
      name: value.name,
      attr : {
        class: value.class,
        id: value.id
      },
      text: value.text
    }
  })
  let newSameData = await sameDataService.addNew(dataObj.name, null, dataObj.attr, dataObj.text);
  console.log(newSameData)
  return res.status(200).send({ success: !!newSameData })
}
module.exports = {
  getAllData: getAllData,
  sameData: sameData
};