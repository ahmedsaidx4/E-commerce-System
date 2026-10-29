const AdminService = require('./admin.service')


const addAdmin = async (req, res, next) => {
  await AdminService.addAdmin(req, res, next);
};



const deleteAdmin = async (req, res, next) => {
  await AdminService.deleteAdmin(req,res,next)
};


const getAllAdmin = async (req, res, next) => {
  await AdminService.getAllAdmin(req,res,next)
};

//-------------------------------------User   route   ------------------------

const getAllUsers = async (req, res, next) => {
 await AdminService.getAllUsers(req,res,next)
};


const getSingleUsers = async (req, res, next) => {
  await AdminService.getSingleUsers(req,res,next)
};



const deleteUser = async (req, res, next) => {
  await AdminService.deleteUser(req, res, next)
};


const updateUserStatus = async (req, res, next) => {
  await AdminService.updateUserStatus(req, res, next) 
};

module.exports = {
  addAdmin,
  deleteAdmin,
  getAllAdmin,
  deleteUser,
  getAllUsers,
  getSingleUsers,
  updateUserStatus,
};
