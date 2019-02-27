const express = require('express');
const mongoose = require('mongoose');
const Project = require('../models/project-model');

const router = express.Router();

//GET projects route - gets all projects
router.get('/projects', (req,res,next)=>{
  Project.find().populate('tasks')
    .then(allProjects => {
      res.json(allProjects);
    })
    .catch((err) => { 
      res.json(err);
    });
});



//POST project route - creates a new project
router.post('/projects', (req, res, next) => {
  let { title, description } = req.body;
  Project.create({
    title,
    description,
    tasks: [],
    owner: req.user._id
  })
    .then(response => {
      res.json(response);
    })
    .catch((err) => {
      res.json(err);
    })
});

//GET project route - gets a single project by id
router.get('/projects/:id', (req, res, next) =>{
  
  if(!mongoose.Types.ObjectId.isValid(req.params.id)){
    res.status(400).json({message: 'Specific id is not valid'});
    return;
  }
  
  Project.findById(req.params.id).populate('tasks')
    .then(response => {
      if(response === null){
        res.status(400).json({message: 'Specific id not found'});
      } else {
        res.status(200).json(response);
      }
    })
    .catch((err) => {
      res.json(err);
    });
});

//PUT project route - updates a specific project
router.put('/projects/:id', (req,res,next) => {
  
  if(!mongoose.Types.ObjectId.isValid(req.params.id)){
    res.status(400).json({message: 'Specific id is not valid'});
    return;
  }

  Project.findByIdAndUpdate(req.params.id, req.body)
    .then(() => {
      res.json({message: `Project with id of ${req.params.id} is updated successfully.`});     
    })
    .catch(err => {
      res.json(err);
    });

});

//DELETE project route - deletes a specific project
router.delete('/projects/:id', (req,res,next) => {

  if(!mongoose.Types.ObjectId.isValid(req.params.id)){
    res.status(400).json({message: 'Specific id is not valid'});
    return;
  }

  Project.findByIdAndDelete(req.params.id)
    .then(() => {
      res.json({message: `Project with id ${req.params.id} was removed successfully`});
    })
    .catch(err =>{
      res.json(err);
    });
});



module.exports = router;