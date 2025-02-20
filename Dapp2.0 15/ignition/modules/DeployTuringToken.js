const { buildModule } = require("@nomicfoundation/ignition-core");

module.exports = buildModule("TuringTokenModule", (m) => {
  const turingToken = m.contract("Turing", []);

  return { turingToken };
});
