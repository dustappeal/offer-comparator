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

function createGraph(d3, data) {
    var chart = d3.select(".chart");
    chart.style("color", "black");
    var bar = chart.selectAll("div");
    var barUpdate = bar.data(data);
    var barEnter = barUpdate.enter().append("div");
    barEnter.style("width", function(d) { return d * 10 + "px"; });
    barEnter.text(function(d) { return d; });
}

function addDates(totalComp) {
    data = [];
    totalComp.forEach(function(item, index) {
        date = new Date();
        date.setFullYear(date.getFullYear()+index);
        data.push({date: date, value: item});
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

	var totalComp = compileCompensation(salary0, relocation0, bonus0, stock0, price0, vest0);
	d3.select("#summary").style("color", "green");
	console.log("about to modify results!");
	document.getElementById('summary').innerHTML = "total comp for " + name0 + " is:" + totalComp;
	createGraph(d3, totalComp);
	console.log("modified results!");
	return false;
};

try {
    // These are here for testing but don't matter in the browser.
    module.exports.validateVest = validateVest;
    module.exports.getStockComp = getStockComp;
    module.exports.getBonusComp = getBonusComp;
    module.exports.getTotalComp = getTotalComp;
    module.exports.compileCompensation = compileCompensation;
    module.exports.addDates = addDates;
} catch (err) {
    console.log("Module doesn't exist in browser... keep calm and carry on.")
}
