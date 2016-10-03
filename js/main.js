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

function doCalculation() {
	var name0 = document.getElementById("name0").value;
	var salary0 = document.getElementById("salary0").value;
	var relocation0 = document.getElementById("relocation0").value;
	var bonus0 = document.getElementById("bonus0").value;
	var stock0 = document.getElementById("stock0").value;
	var price0 = document.getElementById("price0").value;
	var vest0 = document.getElementById("vest0").value;

	document.getElementById('results').innerHTML = "answer is:" + name0;
	return false;
};
module.exports.validateVest = validateVest;
module.exports.getStockComp = getStockComp;
module.exports.getBonusComp = getBonusComp;
