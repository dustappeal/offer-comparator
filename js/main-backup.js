function getStockComp(stock, price, vest) {
    var totalValue = stock * price;
    var vestValues = [];
    vest.forEach(function(item) {
        vestValues.push(item * totalValue / 100);
    })
    return vestValues;
};

function getBonusComp(bonus) {
    var strings = bonus.replace(/$/g, "").replace(/,/g, "").split('/');
    var values = [];
    if (bonus.length == 0) {
        return values;
    }
    strings.forEach(function(item) {
        var value = parseInt(item);
        if (value > 0) {
            values.push(value);
        }
        else {
            throw "Invalid bonus value: " + item;
        }
    });
    return values;
};

function validateVest(vest) {
    var strings = vest.replace(/%/g, "").split('/');
    var percents = [];
    if (vest.length == 0) {
        return percents;
    }
    if (strings.length < 1) {
        throw "Stock vest percentages should be of the format year1/year2/year3"
    }

    var totalPercent = 0;
    strings.forEach(function(item) {
        var value = parseInt(item);
        if (value > 0) {
            percents.push(value);
            totalPercent += value
        }
        else {
            throw "Invalid vest percentage: " + item;
        }
    });
    if (totalPercent != 100) {
        throw "Stock vest percentages don't add to 100, got " + totalPercent
    }
    return percents;
}

function getTotalComp(base, stock, bonus, relocation) {
    var comp = [];
    if (stock.length > bonus.length) {
        var longer = stock;
        var shorter = bonus;
    } else {
        var longer = bonus;
        var shorter = stock;
    }
    longer.forEach(function(value, index) {
        var total = base + value;
        if (index < shorter.length) {
            total += shorter[index];
        }
        comp.push(total);
    });
    while (comp.length < 4) {
        comp.push(base);
    }
    if (relocation > 0) {
        comp[0] += relocation;
    }
    return comp;
}

function compileCompensation(base, relocation, bonus, stock, price, vest) {
    var stockComp = getStockComp(stock, price, validateVest(vest));
    var bonusComp = getBonusComp(bonus);
    var baseVal = parseInt(base);
    var relocationVal = parseInt(relocation);
    if (base.length > 0) {
        if (baseVal <= 0) {
            throw "Base salary is invalid: " + base;
        }
    } else {
        baseVal = 0;
    }
    if (relocation.length > 0 && relocation <= 0) {
        throw "Relocation value is invalid";
    }
    return getTotalComp(baseVal, stockComp, bonusComp, relocationVal);
}

function createGraph(d3, lineData) {
    var vis = d3.select('#graph1'),
        WIDTH = 1000,
        HEIGHT = 500,
        MARGINS = {
          top: 20,
          right: 20,
          bottom: 20,
          left: 50
        },
        xRange = d3.scale.linear().range([MARGINS.left, WIDTH - MARGINS.right]).domain([d3.min(lineData, function(d) {
          return d.x;
        }), d3.max(lineData, function(d) {
          return d.x;
        })]),
        yRange = d3.scale.linear().range([HEIGHT - MARGINS.top, MARGINS.bottom]).domain([d3.min(lineData, function(d) {
          return d.y;
        }), d3.max(lineData, function(d) {
          return d.y;
        })]),
        xAxis = d3.svg.axis()
          .scale(xRange)
          .tickSize(5)
          .tickSubdivide(true),
        yAxis = d3.svg.axis()
          .scale(yRange)
          .tickSize(5)
          .orient('left')
          .tickSubdivide(true);
    
    vis.append('svg:g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + (HEIGHT - MARGINS.bottom) + ')')
      .call(xAxis);
    
    vis.append('svg:g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(' + (MARGINS.left) + ',0)')
      .call(yAxis);
}

function doCalculation() {
    var name0 = document.getElementById("name0").value;
    var salary0 = document.getElementById("salary0").value;
    var relocation0 = document.getElementById("relocation0").value;
    var bonus0 = document.getElementById("bonus0").value;
    var stock0 = document.getElementById("stock0").value;
    var price0 = document.getElementById("price0").value;
    var vest0 = document.getElementById("vest0").value;
var lineData = [{
  x: 1,
  y: 5
}, {
  x: 20,
  y: 20
}, {
  x: 40,
  y: 10
}, {
  x: 60,
  y: 40
}, {
  x: 80,
  y: 5
}, {
  x: 100,
  y: 60
}];
    var totalComp = compileCompensation(salary0, relocation0, bonus0, stock0, price0, vest0);
    document.getElementById('results').innerHTML = "<svg id=\"graph1\" width=\"1000\" height=\"500\"></svg>";
    createGraph(d3, lineData);
    console.log("did calculation");
    return false;
};

try {
    module.exports.validateVest = validateVest;
    module.exports.getStockComp = getStockComp;
    module.exports.getBonusComp = getBonusComp;
    module.exports.getTotalComp = getTotalComp;
    module.exports.compileCompensation = compileCompensation;
} catch (err) {
    console.log("Module doesn't exist in browser... carrying on.");
}
