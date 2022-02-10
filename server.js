const inquirer = require('inquirer');
const cTable = require('console.table');
const connection = require('./connection.js')
const config = require('./config/default.json');

const { appMenuChoices, addEmployeeQuestions } = config

const allEmployeeQuery = `
    SELECT
        e.id,
        e.first_name AS "First Name",
        e.last_name AS "Last Name",
        r.title AS "Title",
        d.department_name AS "Department",
        IFNULL(r.salary, 'No Data') AS "Salary",
        CONCAT(m.first_name," ",m.last_name) AS "Manager"
    FROM employees e
    LEFT JOIN roles r ON r.id = e.role_id 
    LEFT JOIN departments d ON d.id = r.department_id
    LEFT JOIN employees m ON m.id = e.manager_id
    ORDER BY e.id;`

const defaultErrorHandler = (err) => {
    if (err) throw err;
}

const showMainMenu = () => {
    inquirer.prompt({
        name: 'menuChoice',
        type: 'list',
        message: 'What would you like to do?',
        choices: appMenuChoices

    }).then((answer) => {
        const choicesActions = {
            'View all Employees': showAll,
            'Add Employee': addEmployee,
            'Update Employee Role': updateRole,
            'View all Roles': viewRoles,
            'Add Role': addRole,
            'View all Departments': viewDept,
            'Add Department': addDept,
            'Exit': () => connection.end()
        }

        if (choicesActions[answer.menuChoice]) {
            choicesActions[answer.menuChoice]()
        }
        // ALTERNATIVE
        // const choicesActions = [
        //     { action: 'View all Employees', cb: showAll }
        // ]

        // const foundChoice = choicesActions.find(x => x.action === answer.menuChoice)
        // if (foundChoice) {
        //     foundChoice.cb()
        // }

    })
}

const showAll = () => {
    connection.query(allEmployeeQuery, (err, results) => {
        if (err) throw err;
        console.log(' ');
        console.table('All Employees', results)
        showMainMenu();
    })

}

const addEmployee = () => {
    const query = `SELECT CONCAT (first_name," ",last_name) AS name, id AS value FROM employees; SELECT title AS name, id AS value FROM roles`
    connection.query(query, (err, results) => {
        if (err) throw err;

        inquirer.prompt([
            {
                name: 'firstName',
                type: 'input',
                message: addEmployeeQuestions[0]

            },
            {
                name: 'lastName',
                type: 'input',
                message: addEmployeeQuestions[1]
            },
            {
                name: 'role_id',
                type: 'list',
                choices: results[1],
                message: addEmployeeQuestions[2]

            },
            {
                name: 'manager_id',
                type: 'list',
                choices: results[0],
                message: addEmployeeQuestions[3]

            }
        ]).then((answer) => {
            connection.query(
                `INSERT INTO employees(first_name, last_name, role_id, manager_id) VALUES(?, ?, ?, ?)`, [answer.firstName, answer.lastName, answer.role_id, answer.manager_id],
                defaultErrorHandler
            )
            showMainMenu();
        })
    })

}

const updateRole = () => {
    const query = `SELECT CONCAT (first_name," ",last_name) AS name, id AS value FROM employees; SELECT title AS name, id AS value FROM roles`
    connection.query(query, (err, results) => {
        if (err) throw err;

        inquirer.prompt([
            {
                name: 'employee_id',
                type: 'list',
                choices: results[0],
                message: 'Which employee\'s role do you want to update?'
            },
            {
                name: 'role_id',
                type: 'list',
                choices: results[1],
                message: 'Which role do you want to assign the selected employee?'

            }
        ]).then((answer) => {
            const query = `UPDATE employees SET role_id = ? WHERE id = ?`
            connection.query(query, [answer.role_id, answer.employee_id], defaultErrorHandler)
        })


    })

}

// const viewRoles = () => {
//     let query = `SELECT title AS "Title" FROM roles`;
//     connection.query(query, (err, results) => {
//         if (err) throw err;

//         console.log(' ');
//         console.table('All Roles', results);
//         showMainMenu();
//     })

// }

// FIX HERE ============================================
const viewRoles = () => {
    let query = `SELECT id, title AS "Title" FROM roles

    `;
    connection.query(query, (err, results) => {
        if (err) throw err;

        console.log('');
        console.table('All Roles', results);
        showMainMenu();
    })

}
const addRole = () => {
    const addRoleQuery = `SELECT department_name AS name, id AS value FROM departments`
    connection.query(addRoleQuery, (err, results) => {
        if (err) throw err;

        inquirer.prompt([
            {
                name: 'newTitle',
                type: 'input',
                message: 'What is the name of the role?'
            },
            {
                name: 'newSalary',
                type: 'input',
                message: 'What is the salary of the role?'
            },
            {
                name: 'dept_id',
                type: 'list',
                choices: results,
                message: 'Which department does the role belong to?'
            }
        ]).then((answer) => {
            const { newTitle, newSalary, dept_id } = answer
            connection.query(
                `INSERT INTO roles(title, salary, department_id) 
                VALUES (?, ?, ?);`,
                [ newTitle, newSalary, dept_id ],
                defaultErrorHandler
            )
            showMainMenu();
        })
    })
}

const viewDept = () => {
    const query = `SELECT id, department_name AS "Departments" FROM departments`;
    connection.query(query, (err, results) => {
        if (err) throw err;

        console.log('');
        console.table('All Departments', results)
        showMainMenu();
    })
}

const addDept = () => {
    inquirer.prompt([
        {
            name: 'newDept',
            type: 'input',
            message: 'What is the name of the department?'
        }
    ]).then((answer) => {
        connection.query(`INSERT INTO departments(department_name) VALUES( ? )`, answer.newDept, defaultErrorHandler)
        showMainMenu();
    })
}

showMainMenu();