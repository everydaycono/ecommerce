const register = async (req, res) => {
  try {
    return res.send("register");
  } catch (error) {
    console.log(error);
  }
};
const login = async (req, res) => {
  try {
    return res.send("login");
  } catch (error) {
    console.log(error);
  }
};
const logout = async (req, res) => {
  try {
    return res.send("logout");
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  register,
  login,
  logout,
};
