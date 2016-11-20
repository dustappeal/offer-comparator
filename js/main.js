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
		if (value >= 0) {
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
		if (value >= 0) {
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

function getTotalComp(cash, stock) {
	var comp = [];
	if (stock.length > cash.length) {
		var longer = stock;
		var shorter = cash;
	} else {
		var longer = cash;
		var shorter = stock;
	}
	longer.forEach(function(value, index) {
		var total = value;
		if (index < shorter.length) {
			total += shorter[index];
		}
		comp.push(total);
	});
	return comp;
}

function getCashComp(base, bonus, relocation) {
	var comp = [];
	bonus.forEach(function(value, index) {
		comp.push(base + value);
	});
	while (comp.length < 4) {
		comp.push(base);
	}
	if (relocation > 0) {
		comp[0] += relocation;
	}
	return comp;
}

function compileCashComp(base, relocation, bonus) {
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
	return getCashComp(baseVal, bonusComp, relocationVal);
}

function createGraph(d3, data) {
    // set the dimensions and margins of the graph
    var margin = {top: 20, right: 20, bottom: 30, left: 50},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;
    // parse the date / time
    var parseTime = d3.timeParse("%d-%b-%y");
    // set the ranges
    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);
    // define the line
    var valueline = d3.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.value); });
    var svg = d3.select(".chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    // Scale the range of the data
    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain([0.5 * d3.min(data, function(d) { return d.value; }), 1.5 * d3.max(data, function(d) { return d.value; })]);
    
    console.log(valueline);
    console.log(data);
    // Add the valueline path.
    svg.append("path").data([data]).attr("class", "line").attr("d", valueline);
    // Add the X Axis
    svg.append("g").attr("transform", "translate(0," + height + ")").call(d3.axisBottom(x));
    // Add the Y Axis
    svg.append("g").call(d3.axisLeft(y));
}

function addDates(totalComp) {
    data = [];
    totalComp.forEach(function(item, index) {
        thisDate = new Date();
        thisDate.setFullYear(thisDate.getFullYear()+index);
        data.push({date: thisDate, value: item});
    });
    return data;
}

function doCalculation() {
    var name0 = document.getElementById("name0").value;
    var salary0 = document.getElementById("salary0").value;
    var relocation0 = document.getElementById("relocation0").value;
    var bonus0 = document.getElementById("bonus0").value;
    var stock0 = document.getElementById("stock0").value;
    var price0 = document.getElementById("price0").value;
    var vest0 = document.getElementById("vest0").value;
    var stockCompLow = getStockComp(stock0, price0*0.5, validateVest(vest0));
    var stockCompMed = getStockComp(stock0, price0, validateVest(vest0));
    var stockCompHigh = getStockComp(stock0, price0*1.5, validateVest(vest0));

    var cashComp = compileCashComp(salary0, relocation0, bonus0);
    d3.select("#summary").style("color", "green");
    console.log("about to modify results!");
    document.getElementById('summary').innerHTML = "total comp for " + name0 + " is:" + totalComp;
    d3.select("svg").remove() // Remove existing svg
    createGraph(d3, addDates(totalComp));
    console.log("modified results!");
    return false;
};

try {
    // These are here for testing but don't matter in the browser.
    module.exports.validateVest = validateVest;
    module.exports.getStockComp = getStockComp;
    module.exports.getBonusComp = getBonusComp;
    module.exports.getTotalComp = getTotalComp;
    module.exports.getCashComp = getCashComp;
    module.exports.compileCashComp = compileCashComp;
    module.exports.addDates = addDates;
} catch (err) {
    console.log("Module doesn't exist in browser... keep calm and carry on.")
}
