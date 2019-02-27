const express = require('express');
const mongoose = require('mongoose');
const Task = require('../models/task-model');
const Project = require('../models/project-model');


const router = express.Router();

//POST task route - create a new task, then updates specific project with that task
router.post('/tasks', (req, res, next) => {
  let { title, description, project } = req.body;
  Task.create({
    title,
    description,
    project
  })
    .then( response => {
      Project.findByIdAndUpdate(project, {
        $push:{tasks: response._id}
      })
      .then( anotherResponse => {
        res.json(anotherResponse);
      })
      .catch(anotherErr => {
        res.json(err);
      });
    })
    .catch(err => {
      res.json(err);
    })
});


//PUT task route - updates a specific task
router.put('/tasks/:id', (req, res, next) => {
  if(!mongoose.Types.ObjectId.isValid(req.params.id)){
    res.status(400).json({message: 'Invalid id'});
    return;
  }

  Task.findByIdAndUpdate(req.params.id, req.body)
    .then(() => {
      res.json({message: `Task with id of ${req.params.id} was updated successfully`});
    })
    .catch(err => {
      res.json(err);
    });

});


//DELETE task route - deletes a specific task
router.delete('/tasks/:id', (req,res,next) => {
  if(!mongoose.Types.ObjectId.isValid(req.params.id)){
    res.status(400).json({message: 'Invalid id'});
    return;
  }

  Task.findByIdAndDelete(req.params.id)
    .then(() => {
      res.json({message: `Task with id of ${req.params.id} was deleted successfully`});
    })
    .catch(err => {
      res.json(err);
    })
})

module.exports = router;