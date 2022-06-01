const fs = require('fs');


class proccesCSV {
  private csvPath: string;
  private convertedArray: any[];
  constructor() {
    this.csvPath = 'time_series_covid19_deaths_US.csv';
    this.csvToArray();
  }

  private csvToArray(): void {
    const csv: any = fs.readFileSync(this.csvPath, 'utf8');
    const array: any[] = csv.split('\n');
    const headers: any[] = array[0].split(',');
    let convertedArray: any[] = [];

    for (let i = 1; i < array.length; i++) {
      const obj = {};
      const currentLine = array[i].split(',');
      let a = 0;

      for (let j = 0; j < headers.length; j++) {
        if (currentLine[j].startsWith('"')) {
          if (currentLine[j+2].endsWith('"')) {
            const newKey = [currentLine[j], currentLine[j + 1], currentLine[j + 2]].join('');
            obj[headers[j]] = newKey;
            j+=2;
          }
          else {
            const newKey = [currentLine[j], currentLine[j + 1]].join('');
            obj[headers[j]] = newKey;
            j++;
          }
        } else {
          obj[headers[a]] = currentLine[j];
        }
        a++;
      }
      convertedArray.push(obj);
    }
    this.convertedArray = convertedArray;
  }

  public getMinAndMax(): string {
    let total = {};
    let min: any[] = [];
    let max: any[] = [];

    this.convertedArray.forEach(e => {
      if (!total.hasOwnProperty(e.Province_State)) {
        total[e.Province_State] = 0;
      }
      let value: any = Object.values(e).pop();
      total[e.Province_State] += parseInt(value);
    })

    for (let key in total) {
      if (max.length === 0) {
        max.push({ state: key, total: total[key] });
        min.push({ state: key, total: total[key] });
      }
      if (total[key] > max[0].total) {
        max.unshift({ state: key, total: total[key] });
      }
      if (total[key] < min[0].total && total[key] !== 0) {
        min.unshift({ state: key, total: total[key] });
      }
    }
    return `${max[0].state} has the most deaths with ${max[0].total} deaths. 
    ${min[0].state} has the least deaths with ${min[0].total} deaths.`;
  }

  public percentOfDeaths(): string[] {
    let total = {};
    let percent: any[] = [];

    this.convertedArray.forEach(e => {
      if (!total.hasOwnProperty(e.Province_State)) {
        total[e.Province_State] = {
          totalDeaths: 0,
          totalPopulation: 0
        };
      }
      let totalDeaths: any = Object.values(e).pop();
      total[e.Province_State].totalDeaths += parseInt(totalDeaths);
      total[e.Province_State].totalPopulation += parseInt(e.Population);
    })
    
    for (let key in total) {
      if (total[key].totalPopulation != 0) {
        percent.push({ 
          state: key, 
          totalPoulation: total[key].totalPopulation,
          totalDeaths: total[key].totalDeaths,
          Percent_Of_Deaths: parseFloat(((total[key].totalDeaths / total[key].totalPopulation)*100).toFixed(2)) || 0,
        });
      }
    }
    return percent.sort((a, b) => b.Percent_Of_Deaths - a.Percent_Of_Deaths);
  }
}

const csvConverter = new proccesCSV();
console.log(csvConverter.getMinAndMax());
console.log('-------------------------------------------------------------------');
console.table(csvConverter.percentOfDeaths());


