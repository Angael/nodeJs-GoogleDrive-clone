let valid = {
  verifyDir: (dir) => {
    //remove all slashes in beggining and multiples next to eachother
    if(dir === undefined){
      //validation excludes "//" path from existing so it will never be found
      //i don't want to leave array empty, cause sequelize has problems with these in queries
      return ["//"]
    }
    let newDir = String(dir)
    newDir = newDir.replace(/(%|_)+/g, "")
    newDir = newDir.replace(/\/\/+/g, "/")
    //console.log("newDir", newDir);
    //first character can't be slash
    if(newDir[0]==="/"){
      newDir = newDir.slice(1)
    }
    //last character can't be slash
    if(newDir[newDir.length-1]==="/"){
      newDir = newDir.slice(0, -1) // "12345.0"
    }
    //console.log("return newDir", newDir);
    return newDir
  },

  verifyID: (id) => {
    if(id === undefined){
      return -1;
    }
    let newID = Number(id)
    //newDir = newDir.replace(/(%|_)+/g, "")
    return newID
  },

  verifyIDArray: (array) => {
    if(array === undefined || array.length === 0){
      return [-1];
    }
    else{
      //Ensure each id is number
      //-1 will never be existing id, so it wont interfere with id queries
      return array.map((id) => {
        let _id = Number(id)
        if(_id === NaN){
          return -1
        }else{
          return _id
        }
      })
    }
  },

  verifyDirArray: (array) => {
    if(array === undefined || array.length === 0){
      //validation excludes "//" path from existing so it will never be found
      //i don't want to leave array empty, cause sequelize has problems with these in queries
      return ["//"]
    }else{
      let newArray = array
      for (let i = 0; i < newArray.length; i++) {
        newArray[i] = valid.verifyDir(newArray[i])
      }
      return newArray
    }
  },

  // for every path in dir "folder1/folder2" add: "folder1/folder2/%"
  dirAndAnySubDir: (array) => {
    //we need to make deep ycop
    let newArray = array.slice()
    for (let i = 0; i < array.length; i++) {
      const element = array[i]
      newArray.push(element+"/%")
    }
    return newArray
  }
}

module.exports = valid;