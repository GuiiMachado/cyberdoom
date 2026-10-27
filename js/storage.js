const PREFIX='cyberdoom-v1-';
export function readStorage(key,fallback){
  try {const v=localStorage.getItem(PREFIX+key);return v===null?fallback:JSON.parse(v);}catch{return fallback;}
}
export function writeStorage(key,value){
  try{localStorage.setItem(PREFIX+key,JSON.stringify(value));return true;}catch{return false;}
}
export function removeStorage(key){try{localStorage.removeItem(PREFIX+key);return true;}catch{return false;}}
