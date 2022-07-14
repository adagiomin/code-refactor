const invoices = require("./invoices.json");
const plays = require("./plays.json");

console.log(statement(invoices[0], plays));

function statement(invoice, plays) {
  // 中转数据结构，所有计算函数被挪到statement函数中，让renderPlainText只操作传进去的数据
  const result = {};
  result.customer = invoice.customer;
  result.performances = invoice.performances.map(enrichPerformance);
  result.totalAmount = totalAmount(result);
  result.totalVolumeCredits = totalVolumeCredits(result);
  return renderPlainText(result);

  function enrichPerformance(aPerformance) {
    const result = Object.assign({}, aPerformance); // 不想修改传给函数的参数
    result.play = playFor(result);
    result.amount = amountFor(result);
    result.volumeCredits = volumeCreditsFor(result);
    return result;

    function playFor(aPerformance) {
      return plays[aPerformance.playID];
    }

    function amountFor(aPerformance) {
      let thisAmount = 0;
      switch (aPerformance.play.type) {
        case "tragedy":
          thisAmount = 40000;
          if (aPerformance.audience > 30) {
            thisAmount += 1000 * (aPerformance.audience - 30);
          }
          break;
        case "comedy":
          thisAmount = 30000;
          if (aPerformance.audience > 20) {
            thisAmount += 10000 + 500 * (aPerformance.audience - 20);
          }
          thisAmount += 300 * aPerformance.audience;
          break;
        default:
          throw new Error(`unknown type: ${aPerformance.play.type}`);
      }
      return thisAmount;
    }

    function volumeCreditsFor(aPerformance) {
      let result = 0;
      result += Math.max(aPerformance.audience - 30, 0);
      if ("comedy" === aPerformance.play.type)
        result += Math.floor(aPerformance.audience / 5);
      return result;
    }
  }

  function totalAmount(data) {
    return data.performances.reduce((total, p) => total + p.amount, 0);
  }

  function totalVolumeCredits(data) {
    return data.performances.reduce((total, p) => total + p.volumeCredits, 0);
  }
}

function renderPlainText(data) {
  let result = `Statement for ${data.customer}\n`;

  for (let perf of data.performances) {
    result += ` ${perf.play.name}: ${usd(perf.amout / 100)} (${
      perf.audience
    } seats)\n`;
  }

  result += `Amount owed is ${usd(data.totalAmount / 100)}\n`;
  result += `You earned ${data.totalVolumeCredits} credits\n`;
  return result;

  // 震惊，这些还能写在result下面？？？
  function usd(aNumber) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(aNumber);
  }
}
