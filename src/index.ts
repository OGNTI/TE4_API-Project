import { Elysia, t } from "elysia";
import mongoose from "mongoose";
import product from './models/product-model'
import warehouse from './models/warehouse-model'
import employee from './models/employee-model'
import order from './models/order-model'

const months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

await mongoose.connect('mongodb+srv://oliverGranudden:2M8CNI1B5bRuEcEs@bunmymongo.dzh0b.mongodb.net/Company?retryWrites=true&w=majority&appName=BunMyMongo')

new Elysia()
    .get('/employees/search/', async ({ query }) => {
        try {
            let employees = await employee.find({ job: query.job }).populate('warehouse').exec();

            if (query.day) {
                let employeesFiltered = [];
                for (let i = 0; i < employees.length; i++) {
                    for (let j = 0; j < employees[i].schedule.length; j++) {
                        if (employees[i].schedule[j].day == query.day) {
                            employeesFiltered.push(employees[i]);
                        }
                    }
                }
                let employeesRefined = Array<object>()
                employeesFiltered.forEach(e => {
                    employeesRefined.push({
                        _id: e._id,
                        name: e.name,
                        job: e.job,
                        warehouse: e.warehouse.warehouseLocation
                    })
                })
                return employeesRefined;
            }
            return employees;
        } catch (e) {
            return e
        }
    },
        {
            query: t.Object({
                // name: t.Optional(t.String()),
                job: t.String(),
                day: t.Optional(t.String())
                // time: t.Optional(t.String())
            })
        })

    .get('/employees/:id', async ({ params: { id } }) => {
        try {
            if (id === "all") {
                return await employee.find({})
            } else {
                return await employee.find({ _id: id })
            }
        } catch (e) {
            return e
        }
    })

    .get('/warehouses/products/search/', async ({ query }) => {
        try {
            if (query.name) {
                let warehouses = await warehouse.find({}).populate('products.product').exec();
                if (warehouses.length > 0) {
                    let warehousesFiltered = Array<object>()
                    warehouses.forEach((w) => w.products.forEach((p) => {
                        if (p.product.name == query.name) {
                            warehousesFiltered.push({
                                _id: w._id,
                                warehouseLocation: w.warehouseLocation,
                                searchedProduct: { product: p.product, inventory: p.inventory, shelf: p.shelf },
                            })
                        }
                    }))
                    return warehousesFiltered;
                } else {
                    return "Product is not handled by this company."
                }
            } else {
                return await product.find({});
            }
        } catch (e) {
            return e
        }
    })

    .get('/orders/search/', async ({ query }) => {
        try {
            let orders
            if (query.sort == "oldest") {
                orders = await order.find({ status: query.status }).sort({ orderDate: 1 }).populate('products.product picker driver').exec()
            } else {
                orders = await order.find({ status: query.status }).populate('products.product picker driver').exec()
            }

            let filteredOrders = Array<object>()
            orders.forEach((o) => {
                filteredOrders.push({
                    _id: o._id,
                    ordernum: o.orderNum,
                    products: o.products,
                    picker: { _id: o.picker._id, name: o.picker.name },
                    driver: { _id: o.driver._id, name: o.driver.name },
                    status: o.status,
                    orderdate: o.orderDate,
                    completeDate: o.completeDate
                })
            })
            return filteredOrders
        } catch (e) {
            return e
        }
    })

    .get('/orders/cost/total/', async ({ query }) => {
        try {
            let orders = await order.find({}).populate('products.product picker driver').exec()
            let ordersFiltered = orders.filter((o) => o.status == "completed")
            let ordersRefined = ordersFiltered.filter((o) => o.completeDate?.getMonth() == months.indexOf(query.month))

            let cost = Number()
            ordersRefined.forEach((o) => o.products.forEach((p) => {
                cost += p.product.price * p.amount;
            }))

            return ("Total cost: " + cost + " kr\nAmount of orders completed: " + ordersRefined.length)
        } catch (e) {
            return e
        }
    },
        {
            query: t.Object({
                month: t.String()
            })
        })

    .get('/orders/cost/highest/', async ({ query }) => {
        try {
            let orders = await order.find({}).populate('products.product picker driver').exec()
            let ordersFiltered = orders.filter((o) => o.completeDate?.getMonth() == months.indexOf(query.month))

            if (ordersFiltered.length > 0) {

                let highestOrder = ordersFiltered[0]
                let highestCost = 0
                ordersFiltered.forEach((o) => {
                    let cost = Number()
                    o.products.forEach((p) => {
                        cost += p.product.price * p.amount
                    })
                    if (cost > highestCost) {
                        highestCost = cost
                        highestOrder = o
                    }
                })

                let orderRefined = {
                    _id: highestOrder._id,
                    ordernum: highestOrder.orderNum,
                    products: highestOrder.products,
                    picker: { _id: highestOrder.picker._id, name: highestOrder.picker.name },
                    driver: { _id: highestOrder.driver._id, name: highestOrder.driver.name },
                    status: highestOrder.status,
                    orderdate: highestOrder.orderDate,
                    completeDate: highestOrder.completeDate
                }

                return { "Cost of order": highestCost, Order: orderRefined }
            }
            return "No orders this month"
        } catch (e) {
            return e
        }
    },
        {
            query: t.Object({
                month: t.String()
            })
        })

    .listen(3030)


