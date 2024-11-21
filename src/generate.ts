import mongoose, { get, mongo, Schema, set, type MongooseDocumentMiddleware } from 'mongoose'
import product from './models/product-model'
import warehouse from './models/warehouse-model'
import employee from './models/employee-model'
import order from './models/order-model'

const warehouseLocations = ["Stockholm", "Malmö", "London", "Paris", "Sydney", "Moon"]
const productNames = ["Keyboard", "Car", "Table", "Denmark", "Apple", "Banana", "Assault Rifle", "Sven", "Rocket ship", "W72 Nuclear Warhead", "Belaz 75710 haul truck", "Brick", "Cookie", "Watch", "Shoe"]
const employeeNames = ["Bob", "Steve", "Tony", "Jennifer", "Donald", "Kassandra", "John", "Susan", "Emily", "Thomas", "Andrew", "Frank", "Catherine", "Adam", "Henry", "Rachel", "Jerry", "Gary", "Emma", "Larry", "Jason", "Timothy", "Deborah", "Rebecca", "Laura", "Peter", "Megan", "Evelyn", "Andrea", "Joe", "Eve"]
const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const time = [
    "00:00", "00:15", "00:30", "00:45",
    "01:00", "01:15", "01:30", "01:45",
    "02:00", "02:15", "02:30", "02:45",
    "03:00", "03:15", "03:30", "03:45",
    "04:00", "04:15", "04:30", "04:45",
    "05:00", "05:15", "05:30", "05:45",
    "06:00", "06:15", "06:30", "06:45",
    "07:00", "07:15", "07:30", "07:45",
    "08:00", "08:15", "08:30", "08:45",
    "09:00", "09:15", "09:30", "09:45",
    "10:00", "10:15", "10:30", "10:45",
    "11:00", "11:15", "11:30", "11:45",
    "12:00", "12:15", "12:30", "12:45",
    "13:00", "13:15", "13:30", "13:45",
    "14:00", "14:15", "14:30", "14:45",
    "15:00", "15:15", "15:30", "15:45",
    "16:00", "16:15", "16:30", "16:45",
    "17:00", "17:15", "17:30", "17:45",
    "18:00", "18:15", "18:30", "18:45",
    "19:00", "19:15", "19:30", "19:45",
    "20:00", "20:15", "20:30", "20:45",
    "21:00", "21:15", "21:30", "21:45",
    "22:00", "22:15", "22:30", "22:45",
    "23:00", "23:15", "23:30", "23:45"
];
const statusStrings = ["notpicked", "picking", "picked", "shipping", "completed"]
var productIDs = Array<mongoose.Types.ObjectId>()

await mongoose.connect('mongodb+srv://oliverGranudden:2M8CNI1B5bRuEcEs@bunmymongo.dzh0b.mongodb.net/Company?retryWrites=true&w=majority&appName=BunMyMongo')
await generateProducts()
await generateWarehouses()
console.log("Done Done")
await mongoose.disconnect()

async function generateWarehouses() {
    let locations = [...warehouseLocations]
    let warehouseNum = getRandomNumber(locations.length / 2, locations.length)
    let employeeNum = employeeNames.length / warehouseNum
    for (let index1 = 0; index1 < warehouseNum; index1++) {
        let handledProducts = []
        let handledProductIDs = []
        let usedShelves = Array<Number>()
        let usedProducts = Array<Number>()
        let productsNum = getRandomNumber(productNames.length / 3, productNames.length)
        for (let index2 = 0; index2 < productsNum; index2++) {
            let productIndex = getRandomNumber(0, productNames.length)
            while (usedProducts.includes(productIndex)) {
                productIndex = getRandomNumber(0, productNames.length)
            }
            usedProducts.push(productIndex)

            let id = productIDs[productIndex]
            handledProductIDs.push(id)
            let inventory = getRandomNumber(10, 1000)

            let shelf = getRandomNumber(1, 100)
            while (usedShelves.includes(shelf)) {
                shelf = getRandomNumber(1, 100)
            }
            usedShelves.push(shelf)

            handledProducts.push({ product: id, inventory, shelf })
        }

        let locationIndex = getRandomNumber(0, locations.length)
        const newWarehouse = new warehouse({ warehouseLocation: locations[locationIndex], products: handledProducts })
        await generateEmployees(employeeNum, newWarehouse._id)
        await generateOrders(handledProductIDs, newWarehouse._id, locations[locationIndex])
        await newWarehouse.save()
        locations.splice(locationIndex, 1) // remove already used locations
        console.log("Done with " + (index1 + 1) + " warehouses")
    }
}

async function generateProducts() {
    let names = [...productNames]
    for (let index2 = 0; index2 < productNames.length; index2++) {
        let nameIndex = getRandomNumber(0, names.length)
        let name = names[nameIndex]
        names.splice(nameIndex, 1) // remove already used names

        let price = getRandomNumber(1, 1000)
        let weight = getRandomNumber(1, 1000)

        const newProduct = new product({ name, price, weight })
        productIDs.push(newProduct._id)
        await newProduct.save()
    }
}

async function generateEmployees(amount: number, id: mongoose.Types.ObjectId) {
    var names = [...employeeNames]
    for (let index1 = 0; index1 < amount; index1++) {
        let nameIndex = getRandomNumber(0, names.length)
        let name = names[nameIndex]
        names.splice(nameIndex, 1) // remove already used names

        let job
        if (index1 <= amount / 2) {
            job = "picker"
        }
        else {
            job = "driver"
        }

        let schedule = []
        let days = [...weekDays]
        for (let index2 = 0; index2 < 5; index2++) {
            let dayIndex = getRandomNumber(0, days.length)
            let day = days[dayIndex]
            days.splice(dayIndex, 1) // remove already used days

            const startTimes = [time.findIndex((t) => t === "08:00"), time.findIndex((t) => t === "09:00"), time.findIndex((t) => t === "10:00"), time.findIndex((t) => t === "11:00")]
            let startTimeIndex = startTimes[getRandomNumber(0, startTimes.length)]
            let endTimeIndex = startTimeIndex + (8 * 4)

            let timeArr = []
            for (let index3 = startTimeIndex; index3 < endTimeIndex; index3++) {
                timeArr.push(time[index3])
            }
            schedule.push({ day: day, time: timeArr })
        }
        await employee.create({ name: name, job: job, warehouse: id, schedule: schedule })
    }
}

async function generateOrders(productIDs: Array<mongoose.Types.ObjectId>, warehouseID: mongoose.Types.ObjectId, warehouseLocation: string) {
    let usedNums = Array<String>()
    let orderAmount = getRandomNumber(2, 20)
    for (let index = 0; index < orderAmount; index++) {
        let orderNum = warehouseLocations.indexOf(warehouseLocation) + "_" + getRandomNumber(1000, 9999)
        while (usedNums.includes(orderNum)) {
            orderNum = warehouseLocations.indexOf(warehouseLocation) + "_" + getRandomNumber(1000, 9999)
        }
        usedNums.push(orderNum)

        let products = []
        let usedProducts = [{}]
        let productNum = getRandomNumber(1, productNames.length / 2)
        for (let index = 0; index < productNum; index++) {
            let productID = productIDs[getRandomNumber(0, productIDs.length)]
            while (usedProducts.includes(productID)) {
                productID = productIDs[getRandomNumber(0, productIDs.length)]
            }
            usedProducts.push(productID)

            let amount = getRandomNumber(1, 1000)
            products.push({ product: productID, amount })
        }

        let pickers = await employee.find({ job: "picker", warehouse: warehouseID })
        let picker = pickers[getRandomNumber(0, pickers.length)]._id

        let drivers = await employee.find({ job: "driver", warehouse: warehouseID })
        let driver = drivers[getRandomNumber(0, drivers.length)]._id

        let status = statusStrings[getRandomNumber(0, statusStrings.length)]

        let orderDate = getRandomDate(new Date('January 1, 2024, 00:00:00'), new Date())

        let newOrder = new order({ orderNum, products, picker, driver, status, orderDate })
        if (status == statusStrings[statusStrings.length - 1]) {
            newOrder.completeDate = getRandomDate(orderDate, new Date())
        }
        await newOrder.save()
    }
}

function getRandomNumber(min: number, max: number) {
    let minCeiled = Math.ceil(min);
    let maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}

function getRandomDate(from: Date, to: Date) {
    const fromTime = from.getTime();
    const toTime = to.getTime();
    return new Date(fromTime + Math.random() * (toTime - fromTime));
}




// somehow make employees have an array of their assigned orders, either orderNums or _id