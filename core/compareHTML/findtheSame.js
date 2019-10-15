const fs = require('fs');
const cheerio = require('cheerio');
const HTMLPaser = require('node-html-parser');
const _ = require('lodash');
const FOLDER_PAGE = '../../raw-html/';
const helper = require('./helpers');

module.exports = function() {
  var arrStorage = [];
  const GetTagHtml = fsfile => {
    const FILE_STORAGE = fs.readFileSync(`${FOLDER_PAGE}${fsfile}`, 'utf8');
    const $ = cheerio.load(FILE_STORAGE, {
      decodeEntities: false
    });
    const body = $('body').html();
    const root = HTMLPaser.parse(body, {
      lowerCaseTagName: false, // convert tag name to lower case (hurt performance heavily)
      script: false, // retrieve content in <script> (hurt performance slightly)
      style: false, // retrieve content in <style> (hurt performance slightly)
      pre: false
    }).removeWhitespace();
    //
    let nodeList = new Array();
    function recursion(node, level) {
      if (
        node.tagName != undefined &&
        node.tagName != null &&
        node.tagName !== 'script' &&
        node.tagName !== 'br' &&
        node.tagName !== 'noscript' &&
        node.tagName !== 'input' &&
        node.tagName !== 'link' &&
        node.tagName !== 'style' &&
        node.tagName !== 'button' &&
        node.tagName !== 'em' &&
        node.tagName !== 'ins' &&
        node.tagName !== 'blockquote' &&
        node.tagName !== 'strong' &&
        node.text !== ''
      )
      if(node.rawAttributes.class !== undefined ||node.rawAttributes.id !== undefined || node.rawAttributes.href !== undefined || node.rawAttributes.src !== undefined  )
        nodeList.push({
          name: node.tagName,
          level: level,
          attr: node.rawAttributes,
          text: node.text
        });
      if (node.childNodes.length == 0) {
        return;
      }
      node.childNodes.forEach(childNode => {
        level++;
        recursion(childNode, level);
        level--;
      });
    }
    recursion(root, 0);
    arrStorage.push(helper.removeDupObject(nodeList));
  };
  function flatten(arr) {
    var flat = [];
    for (var i = 0; i < arr.length; i++) {
      flat = flat.concat(arr[i]);
    }
    return flat;
  }
  return {
    func: function(fn) {
      fs.readdir(FOLDER_PAGE, async (err, folders) => {
        if (err) throw err;
        let data = [];
        folders.forEach(folder => data.push(folder));
        data.forEach(value => GetTagHtml(`${value}`, 'utf8'));
        var arrDup = flatten(arrStorage);
        let dup = helper.removeDupObject(helper.findDupObject(arrDup));
        fn(dup);
      });
    }
  };
};
