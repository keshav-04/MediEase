//prisma client
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient()
const {v4 : uuidv4} = require('uuid')

// @desc    Get Medicine List
// route    GET /api/medicine/list
// @access  Private (Admin)
const getMedicineList = async(req, res, next) => {
    try {
        const medicineList = await prisma.medicine.findMany({
            include: {
                Category: true // Include the category information
            }
        });
        
        // Extract the required fields from the result and construct the response
        const responseData = medicineList.map(medicine => ({
            id: medicine.id,
            brandName: medicine.brandName,
            saltName: medicine.saltName,
            categoryName: medicine.Category.categoryName // Access the categoryName from the category information
        }));
        
        return res.status(200).json({
            ok: true,
            data: responseData,
            message: "Medicine List retrieved successfully"
        });
    } catch (err) {
        console.log(`Medicine List Fetching Error : ${err.message}`);
        
        return res.status(500).json({
            ok: false,
            data: [],
            message: "Fetching Medicine list failed, Please try again later"
        });
    }
};

// @desc    Create Medicine List Records
// route    POST /api/medicine/create
// @access  Private (Admin)
const createMedicineList = async(req, res, next) => {
    try {
        // console.log(req.body);
        const { saltName, brandName, categoryId} = req.body;
        // Check if categoryId exists in the database
        const category = await prisma.category.findUnique({
            where: {
                id: categoryId
            }
        });

        if (!category) {
            return res.status(404).json({
                ok: false,
                message: `Category with id ${categoryId} not found`
            });
        }

        // Create medicine record
        const createdRecord = await prisma.medicine.create({
            data: {
                saltName,
                brandName,
                categoryId
            }
        });  
        
        return res.status(200).json({
            ok: true,
            data: createdRecord,
            message: "Medicine List record created successfully"
        });
    } catch (err) {
        console.log(`Medicine List Creating Error : ${err.message}`);
        
        return res.status(500).json({
            ok: false,
            data: [],
            message: `Creating Medicine list record failed, Please try again later`
        });
    }
};


// @desc    Update Medicine List Record
// route    PUT /api/medicine/update
// @access  Private (Admin) 
const updateMedicineList = async(req, res, next) => {
    try {
        const { id } = req.body;
        const updatedRecord = await prisma.medicine.update({
            where: {
                id,
            },
            data: {
                ...req.body
            },
        });

        // console.log(updatedRecord);  
        
        return res.status(200).json({
            ok: true,
            data: updatedRecord,
            message: "Medicine List record updated successfully"
        });
    } catch (err) {
        console.log(`Medicine List Updating Error : ${err.message}`);
        
        const errMsg = "Updating medicine list record failed, Please try again later";
        const errCode = 500;

        //record does not exist
        if (err.code === 'P2025') {
            errMsg = "Record does not exist"
            errCode = 404;
        }

        return res.status(errCode).json({
            ok: false,
            data: [],
            message: errMsg,
        });
    }
};


// @desc    Delete Medicine List Record
// route    DELETE /api/medicine/delete
// @access  Private (Admin) 
const deleteMedicineList = async(req, res, next) => {
    try {
        console.log("req.body : ", req.body);
        const { id } = req.body;
        
        const deletedRecord = await prisma.medicine.delete({
            where: {
              id: id,
            },
        });
          
        return res.status(200).json({
            ok: true,
            data: deletedRecord,
            message: "Medicine List Record deleted successfully"
        });
    } catch (err) {
        console.log(`Medicine List Deletion Error : ${err.message}`);
        
        const errMsg = "Deleting medicine list record failed, Please try again later";
        const errCode = 500;

        //record does not exist
        if (err.code === 'P2025') {
            errMsg = "Record does not exist"
            errCode = 404;
        }

        return res.status(errCode).json({
            ok: false,
            data: [],
            message: errMsg,
        });
    }
};


// @desc    Get Category List
// route    GET /api/medicine/category/list
// @access  Private (Admin)
const getCategoryList = async(req, res, next) => {
    try {
        const categoryList = await prisma.category.findMany({});
        // console.log(categoryList);  
        
        return res.status(200).json({
            ok: true,
            data: categoryList,
            message: "Category List retrieved successfully"
        });
    } catch (err) {
        console.log(`Category List Fetching Error : ${err.message}`);
        
        return res.status(500).json({
            ok: false,
            data: [],
            message: "Fetching Category list failed, Please try again later"
        });
    }
}

// @desc    Get Single Category 
// route    GET /api/medicine/category/:id
// @access  Private (Admin)
const getCategory = async(req, res, next) => {
    try {
        const { id } = req.params;
        const category = await prisma.category.findUnique({
            where: {
                id: id
            }
        });
        // console.log(category);  
        
        return res.status(200).json({
            ok: true,
            data: category,
            message: "Category retrieved successfully"
        });
    } catch (err) {
        console.log(`Category Fetching Error : ${err.message}`);
        
        return res.status(500).json({
            ok: false,
            data: [],
            message: "Fetching Category failed, Please try again later"
        });
    }
}

// @desc    Create Category Records
// route    POST /api/medicine/category/create
// @access  Private (Admin)
const createCategory = async(req, res, next) => {
    try {
        console.log(req.body);
        const { categoryName, strengthType } = req.body;
        const createdRecord = await prisma.category.create({
            data: {
                categoryName,
                strengthType
            }
        });
        
        // console.log(createdRecord);  
        
        return res.status(200).json({
            ok: true,
            data: createdRecord,
            message: "Category record created successfully"
        });
    } catch (err) {
        console.log(`Category Creating Error : ${err.message}`);
        
        return res.status(500).json({
            ok: false,
            data: [],
            message: `Creating Category record failed, Please try again later`
        });
    }
};


// @desc    Update Category List Record
// route    PUT /api/medicine/category/update
// @access  Private (Admin) 
const updateCategory = async(req, res, next) => {
    try {
        const { id } = req.body;
        const updatedRecord = await prisma.category.update({
            where: {
                id,
            },
            data: {
                ...req.body
            },
        });

        // console.log(updatedRecord);  
        
        return res.status(200).json({
            ok: true,
            data: updatedRecord,
            message: "Category List record updated successfully"
        });
    } catch (err) {
        console.log(`Category List Updating Error : ${err.message}`);
        
        const errMsg = "Updating category list record failed, Please try again later";
        const errCode = 500;

        //record does not exist
        if (err.code === 'P2025') {
            errMsg = "Record does not exist"
            errCode = 404;
        }

        return res.status(errCode).json({
            ok: false,
            data: [],
            message: errMsg,
        });
    }
};


// @desc    Delete Category List Record
// route    DELETE /api/medicine/category/delete
// @access  Private (Admin) 
const deleteCategory = async(req, res, next) => {
    try {
        // console.log("req.body : ", req.body);
        const { id } = req.body;
        
        const deletedRecord = await prisma.category.delete({
            where: {
              id: id,
            },
        });
          
        return res.status(200).json({
            ok: true,
            data: deletedRecord,
            message: "Category List Record deleted successfully"
        });
    } catch (err) {
        console.log(`Category List Deletion Error : ${err.message}`);
        
        const errMsg = "Deleting category list record failed, Please try again later";
        const errCode = 500;

        //record does not exist
        if (err.code === 'P2025') {
            errMsg = "Record does not exist"
            errCode = 404;
        }

        return res.status(errCode).json({
            ok: false,
            data: [],
            message: errMsg,
        });
    }
};



module.exports = {
    getMedicineList, 
    createMedicineList, 
    updateMedicineList, 
    deleteMedicineList,
    getCategory,
    getCategoryList, 
    createCategory, 
    updateCategory,
    deleteCategory
};