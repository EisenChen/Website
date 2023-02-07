import fs from 'fs'
import yaml from 'yaml'

const file = fs.readFileSync('./exam.yaml','utf8');
console.log(yaml.parse(file));