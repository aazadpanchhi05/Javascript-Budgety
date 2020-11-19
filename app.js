var budgetController = (function(){
    
    var Expense = function(id,description,value){
        this.id=id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calculatePercentage = function(totalIncome){
        if(totalIncome>0)
        {
            this.percentage = Math.round((this.value/totalIncome) * 100);
        }
        else
        {
            this.percentage=-1;
        }
       
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };

    var Income = function(id,description,value){
        this.id=id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type){
        var sum = 0 ;
        data.allItems[type].forEach(function(cur){
            sum = sum + cur.value;
        });

        data.totals[type] = sum;

    };

    var data = {
        allItems: {
            exp:[],
            inc:[]
        },

        totals: {
            exp:0,
            inc:0
        },

        budget:0,
        percentage: -1
    };

    return{
        addItem : function(type,des,val){
            var newItem, ID;

            //Create New ID
            if(data.allItems[type].length>0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }
            else{
                ID=0;
            }

            //Check Its Expense Or Income
            if(type == 'exp')
            {
                newItem = new Expense(ID,des,val);
            }
            else if(type == 'inc')
            {
                newItem = new Income(ID,des,val);
            }

            //Push Into arrays
            data.allItems[type].push(newItem);

            return newItem;

        },

        deleteItem : function(type,id){
            var ids,index;

            ids = data.allItems[type].map(function(current){
                return current.id;
            });

            index = ids.indexOf(id);

            if(id !== -1)
            {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function(){
            //calculate income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //calculate the budget
            data.budget = data.totals.inc - data.totals.exp;

            //calculate the % of income that we spent
            if(data.totals.inc>0)
            {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }
            else{
                data.percentage = -1;
            }
        },

        calculatePercentages: function(){
            data.allItems.exp.forEach(function(current){
                current.calculatePercentage(data.totals.inc);
            });
        },

        getPercentage: function(){
            var allPerc = data.allItems.exp.map(function(current){
                return current.getPercentage();
                });
            return allPerc;
        },

        getBudget: function(){
            return{
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function(){
            console.log(data);
        }
    };

})();

var UIController = (function(){

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel:'.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentage: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function(num, type){
        var numSplit,int, dec;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split(".");

        int = numSplit[0];
        if(int.length >3)
        {
            int = int.substr(0, int.length-3) + "," + int.substr(int.length-3, int.length-1);
        }

        dec = numSplit[1];

        return (type == 'exp' ? '-' : '+') + " " + int + "." + dec;
    };

    var nodeListForEach = function(lists, callBack){
        for(var i = 0; i<lists.length; i++)
        {
            callBack(lists[i], i);
        }
    };

    return{
        getInput: function(){
            return{
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem: function(obj, type){
            var html, newHtml, element;

            //Create HTML with placeholder
            if(type == 'inc')
            {
                element= DOMstrings.incomeContainer;
                html= '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else if(type== 'exp')
            {
                element=DOMstrings.expensesContainer;
                html= '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            //replace placeholder with actual code
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%',formatNumber(obj.value, type));

            //Insert HTML into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        deleteListIteam : function(selectorID){
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);

        },

        clearFields : function() {
            var field, fieldArr;

            field = document.querySelectorAll(DOMstrings.inputDescription + ", " + DOMstrings.inputValue);

            fieldArr = Array.prototype.slice.call(field);

            fieldArr.forEach(function(current, index, array){
                current.value = ""; 
            });

            fieldArr[0].focus();
        },

        displayBudget: function(obj){
            var type;

            obj.budget >= 0 ? type='inc' : type='exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
           

            if(obj.percentage > 0)
            {
                document.querySelector(DOMstrings.percentage).textContent = obj.percentage + '%';
            }
            else
            {
                document.querySelector(DOMstrings.percentage).textContent = '---';
            }

        },

        displayPercentage: function(percentages){
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            nodeListForEach(fields, function(current, index){
                if(percentages[index]>0)
                {
                    current.textContent = percentages[index] + "%";
                }
                else
                {
                    current.textContent = "--";
                }
                
            });
        },

        displayDate: function(){
            var now, months, month, year;

            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            year = now.getFullYear();

            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + " - " + year + " ";
        },

        changedType: function(){
            var fiels = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            );

            nodeListForEach(fiels, function(cur){
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        getDOMstrings: function(){
            return DOMstrings;
        }
    };

})();

var AppController = (function( budgetCtrl, UICtrl ){

    var setUpEventListner = function(){
        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event){
        
        if(event.keyCode==13 || event.which==13)
        {
            ctrlAddItem();
        }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);

    };
    

    var updateBudget = function(){
        //calculate the budget
        budgetCtrl.calculateBudget();

        //return budget
        var budget = budgetCtrl.getBudget();

        //display the budget on the UI
        UICtrl.displayBudget(budget);

    };

    var updatePercentage = function(){
        //calculate %
        budgetCtrl.calculatePercentages();

        //Read From budgetController
        var percentages = budgetCtrl.getPercentage();

        //update the UI with new %
        UICtrl.displayPercentage(percentages);

    };

    var ctrlAddItem = function(){
        var input, newItem;

        //Get the field input data
        input = UICtrl.getInput();

        if(input.description !== "" && input.value>0)
        {
             //add the item into budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            //Clear All Field
            UICtrl.clearFields();

            //update and display Budget
            updateBudget();

            //update and change percentage
            updatePercentage();
        }
    };

    var ctrlDeleteItem = function(event){
        var itemId, splitId, type,ID;

        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemId)
        {
            splitId = itemId.split('-');
            type = splitId[0];
            ID = parseInt(splitId[1]);

            //delete the item from the DSA
            budgetCtrl.deleteItem(type, ID);

            //delete the item from UI
            UICtrl.deleteListIteam(itemId);

            //Update and show budget in UI
            updateBudget();

            //update and change percentage
            updatePercentage();
        }

    };

    

    return{
        init: function(){
            console.log("Application Has Started!!");
            UICtrl.displayDate();
            UICtrl.displayBudget({budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1});
            setUpEventListner();
        }
    }

})( budgetController, UIController);

AppController.init();