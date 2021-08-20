const fs = require("fs");
const path = require("path");
const { parse } = require("fast-csv");
const fam = {};

// lookup table for families
fs.createReadStream(path.resolve(__dirname, "input", "families.csv"))
  .pipe(parse({ headers: true }))
  .on("error", (error) => console.error(error))
  .on("data", (row) => {
    fam[row["2L"]] = row["Full Name"];
  });
//.on("end", (rowCount) => console.log(fam));

var readme = `# List of Tailored Controls 

| ID | Family | Name | Sub | Notes |
| -- | ------ | ---- | --- | ----- |
`;

fs.createReadStream(
  path.resolve(
    __dirname,
    "input",
    //"NIST_SP-800-53_rev5_MODERATE-baseline_profile_load.csv"
    "figma.csv"
  )
)
  .pipe(parse({ headers: true }))
  .on("error", (error) => console.error(error))
  .on("data", (row) => {
    // identifier,name,control_text,discussion,related
    var idfam = row.identifier.substring(0, 2);
    thisControl = `# ${row.identifier} / ${row.name}\n\n`;
    thisControl += `_(${fam[idfam]})_\n\n`;
    thisControl += "## Control Text\n\n";
    thisControl += row.control_text;
    thisControl += "\n\n## Discussion\n\n";

    row.discussion = row.discussion.replace(/\n/g, "\n\n");
    thisControl += row.discussion;
    thisControl += "\n\n## Implementation\n\n";
    thisControl += "_(add implementation details here)_";

    readme += `|[${row.identifier}](${row.identifier}.md)|${fam[idfam]}|${row.name}||\n`;

    fs.writeFile("output/" + row.identifier + ".md", thisControl, (err) => {
      if (err) throw err;
    });

    //console.log(thisControl);
    //console.log(row);
  })
  .on("end", (rowCount) => {
    console.log(`Parsed ${rowCount} rows`);
    fs.writeFile("output/README.md", readme, (err) => {
      if (err) throw err;
    });
  });
