class CalculatorController {
  constructor() {
    this._lastOperator = "";
    this._lastNumber = "";
    this._locale = "pt-BR";
    this._displayCalcEl = document.querySelector("#display"); // pega o elemento de display da calculadora
    this._dateEl = document.querySelector("#data"); // pega o elemento de data da calculadora
    this._timeEl = document.querySelector("#hora"); // pega o elemento de hora da calculadora
    this._currentDate;
    this._operation = [];
    this.initialize();
    this.initButtonsEvents();
  }

  /**
   * Getters and Setters
  **/

  get displayDate() {
    return this._dateEl.innerHTML;
  }

  set displayDate(value) {
    this._dateEl.innerHTML = value;
  }

  get displayTime() {
    return this._timeEl.innerHTML;
  }

  set displayTime(value) {
    this._timeEl.innerHTML = value;
  }

  get displayCalc() {
    return this._displayCalcEl.innerHTML;
  }

  set displayCalc(value) {
    this._displayCalcEl.innerHTML = value;
  }

  get currentDate() {
    return new Date();
  }

  set currentDate(value) {
    this._currentDate = value;
  }

  /**
   * Methods
  */

  initialize() {
    this.setDisplayDateTime();

    // chama a função de 1 em 1 segundo para alterar a data/hora
    setInterval(() => {
      this.setDisplayDateTime();
    }, 1000);

    this.setLastNumberToDisplay();
  }

  // pega a data/hora atual e seta seus elementos html - de acordo com a região
  setDisplayDateTime() {
    this.displayDate = this.currentDate.toLocaleDateString(this._locale);
    this.displayTime = this.currentDate.toLocaleTimeString(this._locale);
  }

  // trata eventos dos botões selecionados
  initButtonsEvents() {
    // pega todos os botões
    let buttons = document.querySelectorAll("#buttons > g, #parts > g");

    buttons.forEach((button, index) => {
      this.addEventListenerAll(button, "click drag", e => {
        // remove caracteres indesejados do valor do botão
        let textBtn = button.className.baseVal.replace("btn-", "");
        // qd o botão é pressionado chama a função responsável por armazenar o valor
        this.execBtn(textBtn);
      });

      this.addEventListenerAll(button, "mouseover mouseup mousedown", e => {
        // adiciona o estilo de pointer para o cursor
        button.style.cursor = "pointer";
      });
    });
  }

  // pega o botão e o evento feito pelo usuário e chama os eventos um de cada vez
  addEventListenerAll(element, events, fn) {
    events.split(" ").forEach(event => {
      element.addEventListener(event, fn, false);
    });
  }

  // realiza ações diferentes conforme o tipo do botão selecionado
  execBtn(value) {
    switch (value) {
      case "soma":
        this.addOperation("+");
        break;

      case "subtracao":
        this.addOperation("-");
        break;

      case "multiplicacao":
        this.addOperation("*");
        break;

      case "divisao":
        this.addOperation("/");
        break;

      case "porcento":
        this.addOperation("%");
        break;

      case "igual":
        this.calc();
        break;

      case "ponto":
        this.addDot();
        break;

      case "ce":
        this.clearEntry();
        break;

      case "ac":
        this.clearAll();
        break;

      case "0":
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9":
        this.addOperation(parseInt(value)); // faz o cast da variável value de string para int
        break;

      default:
        this.setError();
        break;
    }
  }

  addOperation(value) {
    // se a última operação salva não for número! (na primeira vez retorna undefined, pois não tem um operador prévio)
    if (isNaN(this.getLastOperation())) {
      // se o valor selecionado é um operador
      if (this.isOperator(value)) {
        this.setLastOperation(value);
      } // se o valor selecionado não for um operador
      else {
        // aqui sabemos que o valor selecionado é um número
        this.pushOperation(value);
        this.setLastNumberToDisplay();
      }
      // se a última operação salva for número!
    } else {
      // se o valor selecionado é operador!
      if (this.isOperator(value)) {
        this.pushOperation(value);
        // se for número!
      } else {
        let valorFinal = this.getLastOperation().toString() + value.toString();
        this.setLastOperation(valorFinal);
        this.setLastNumberToDisplay();
      }
    }
  }

  addDot(){
    let lastOperation = this.getLastOperation();

    if (typeof lastOperation === 'string' && lastOperation.split('').indexOf('.') > -1) return;

    if(this.isOperator(lastOperation) || !lastOperation){
      this.pushOperation('0.');
    }else{
      this.setLastOperation(lastOperation.toString() + '.');
    }

    this.setLastNumberToDisplay();
  }

  // recupera o último elemento da operação
  getLastOperation() {
    return this._operation[this._operation.length - 1];
  }

  // checa se o elemento digitado é um operador
  isOperator(value) {
    return ["+", "-", "*", "%", "/"].indexOf(value) > -1;
  }

  // inclui um elemento na última posição
  pushOperation(value) {
    this._operation.push(value);

    // caso tiver mais que 3 itens no array chama o método calc
    if (this._operation.length > 3) {
      this.calc();
    }
  }

  // remove o último item do elemento para fazer a operação do par e depois junta
  calc() {
    let last = "";
    this._lastOperator = this.getLastItem();

    if(this._operation.length < 3){
      let firstItem = this._operation[0];
      this._operation = [firstItem, this._lastOperator, this._lastNumber];
    }

    if (this._operation.length > 3) {
      last = this._operation.pop();
      this._lastNumber = this.getResult();
      
    } else if(this._operation.length == 3) {
      
      this._lastNumber = this.getLastItem(false);
    }

    let result = this.getResult();

    if (last == "%") {
      result /= 100;
      this._operation = [result];
    } else {
      this._operation = [result];

      if (last) this._operation.push(last);
    }

    this.setLastNumberToDisplay();
  }

  // calcula o resultado do par
  getResult() {
    return eval(this._operation.join(""));
  }

  // substitui o array pelo valor novo inputado
  setLastOperation(value) {
    this._operation[this._operation.length - 1] = value;
  }

  // pega o último item do array
  getLastItem(isOperator = true) {
    let lastItem;
    for (let i = this._operation.length - 1; i >= 0; i--) {
      if (this.isOperator(this._operation[i]) == isOperator) {
        lastItem = this._operation[i];
        break;
      }
    }

    if(!lastItem){
      lastItem = (isOperator) ? this._lastOperator : this._lastNumber;
    }

    return lastItem;
  }

  // exibe o último valor da operação na tela
  setLastNumberToDisplay() {
    let lastNumber = this.getLastItem(false);
    if (!lastNumber) lastNumber = 0;

    this.displayCalc = lastNumber;
  }

  // qd acionado limpa toda a operação do usuário
  clearAll() {
    this._operation = [];
    this._lastNumber = '';
    this._lastOperator = '';

    this.setLastNumberToDisplay();
  }

  // qd acionado limpa a última operação do usuário
  clearEntry() {
    this._operation.pop();
    this.setLastNumberToDisplay();
  }

  // qd acionado coloca um texto de error no display
  setError() {
    this.displayCalc = "Error";
  }

}
