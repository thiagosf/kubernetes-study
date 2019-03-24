module.exports = (sequelize, DataTypes) => {
  const Counter = sequelize.define('Counter', {
    counter: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    timestamps: true,
    underscored: true,
    underscoredAll: true,
    freezeTableName: true,
    tableName: 'counters'
  })

  Counter.add = function () {
    return Counter.findOne().then(counter => {
      const out = counter => counter.counter
      if (counter) {
        counter.counter++
        return counter.save().then(out)
      } else {
        return Counter.create({
          counter: 1,
          created_at: new Date(),
          updated_at: new Date()
        }).then(out)
      }
    })
  }

  return Counter
}
