import fs from "fs"

export const writeToJsonFile = async (content) => {
  fs.writeFile(
    `out/out-${new Date().getTime()}.json`,
    JSON.stringify(content, null, 2),
    (err) => {
      if (err) {
        console.error(err)
        return
      }
    }
  )
}
