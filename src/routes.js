"use strict";

const resetDB = require("../config/scripts/populateDB")

const Companion = require("./schema/Companion");
const Doctor = require("./schema/Doctor");

const express = require("express");
const FavoriteDoctor = require("./schema/FavoriteDoctor");
const FavoriteCompanion = require("./schema/FavoriteCompanion");
const router = express.Router();


// completely resets your database.
// really bad idea irl, but useful for testing
router.route("/reset")
    .get((_req, res) => {
        resetDB(() => {
            res.status(200).send({
                message: "Data has been reset."
            });
        });
    });

router.route("/")
    .get((_req, res) => {
        console.log("GET /");
        res.status(200).send({
            data: "App is running."
        });
    });
    
// ---------------------------------------------------
// Edit below this line
// ---------------------------------------------------
router.route("/doctors")
    .get((req, res) => {
        console.log("GET /doctors");

        // already implemented:
        Doctor.find({})
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(500).send(err);
            });
    })
    .post((req, res) => {
        console.log("POST /doctors");
        Doctor.create(req.body).save()
            .then(doctor => {
                res.status(201).send(doctor);
            })
            .catch(err => {
                res.status(500).send(err);
            })
    });

// optional:
router.route("/doctors/favorites")
    .get((req, res) => {
        console.log(`GET /doctors/favorites`);
        FavoriteDoctor.find({})
            .then(favoriteDoctors => {
                let ids = favoriteDoctors.map(doc => doc.doctor)
                Doctor.find({"_id": { $in: ids }})
                    .then(doctors => {
                        res.status(200).send(doctors);
                    })
                    .catch(err => {
                        res.status(500).send(err);
                    });
            })
            .catch(err => {
                res.status(500).send(err);
            });
    })
    .post((req, res) => {
        console.log(`POST /doctors/favorites`);
        FavoriteDoctor.create(req.body).save()
            .then(doctor => {
                res.status(201).send(doctor);
            })
            .catch(err => {
                res.status(500).send(err);
            })
    });
    
router.route("/doctors/:id")
    .get((req, res) => {
        console.log(`GET /doctors/${req.params.id}`);
        Doctor.findById(req.params.id)
            .then(doctor => {
                res.status(200).send(doctor);
            })
            .catch(err => {
                res.status(404).send("doctor not found");
            })
    })
    .patch((req, res) => {
        console.log(`PATCH /doctors/${req.params.id}`);
        Doctor.findByIdAndUpdate(req.params.id, req.body)
            .then(doctor => {
                Doctor.findById(req.params.id)
                    .then(updatedDoc => {
                        res.status(200).send(updatedDoc);
                    })
                    .catch(err => {
                        res.status(500).send(err);
                    })
            })
            .catch(err => {
                res.status(500).send(err);
            })
    })
    .delete((req, res) => {
        console.log(`DELETE /doctors/${req.params.id}`);
        Doctor.findByIdAndDelete(req.params.id)
            .then(doctor => {
                res.status(200).send();
            })
            .catch(err => {
                res.status(404).send("not found");
            })
    });
    
router.route("/doctors/:id/companions")
    .get((req, res) => {
        console.log(`GET /doctors/${req.params.id}/companions`);
        Doctor.findById(req.params.id)
            .then(doctor => {
                Companion.find({doctors : { $in: [req.params.id] } })
                    .then(companions => {
                        res.status(200).send(companions);
                    })
                    .catch(err => {
                        res.status(404).send("not found")
                    })
            })
            .catch(err => {
                res.status(404).send("doctor not found")
            })
    });
    

router.route("/doctors/:id/goodparent")
    .get((req, res) => {
        console.log(`GET /doctors/${req.params.id}/goodparent`);
        Companion.find({ doctors : { $in: [req.params.id]} })
            .then(companions => {
                let isAlive = true;

                for (var i = 0; i < companions.length; i++){
                    if (companions[i].alive == false){
                        isAlive = false;
                    }
                }
                res.status(200).send(isAlive);
            })
            .catch(err => {
                res.status(404).send("not found")
            })
    });

// optional:
router.route("/doctors/favorites/:doctor_id")
    .delete((req, res) => {
        console.log(`DELETE /doctors/favorites/${req.params.doctor_id}`);
        FavoriteDoctor.findByIdAndDelete(req.params.doctor_id)
            .then(doctor => {
                res.status(201).send();
            })
            .catch(err => {
                res.status(500).send(err);
            })
    });

router.route("/companions")
    .get((req, res) => {
        console.log("GET /companions");
        // already implemented:
        Companion.find({})
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(500).send(err);
            });
    })
    .post((req, res) => {
        console.log("POST /companions");
        Companion.create(req.body).save()
            .then(companion => {
                res.status(201).send(companion);
            })
            .catch(err => {
                res.status(500).send(err);
            })
    });

router.route("/companions/crossover")
    .get((req, res) => {
        console.log(`GET /companions/crossover`);
        Companion.find({$expr: {$gt: [{$size: "$doctors"}, 1]}})
            .then(companions => {
                res.status(200).send(companions);
            })
            .catch(err => {
                res.status(404).send("not found");
            })
    });

// optional:
router.route("/companions/favorites")
    .get((req, res) => {
        console.log(`GET /companions/favorites`);
        FavoriteCompanion.find({})
            .then(favoriteComps => {
                let ids = favoriteComps.map(comp => comp.companion)
                Companion.find({"_id": { $in: ids }})
                    .then(companions => {
                        res.status(200).send(companions);
                    })
                    .catch(err => {
                        res.status(500).send(err);
                    });
            })
            .catch(err => {
                res.status(500).send(err);
            });
    })
    .post((req, res) => {
        console.log(`POST /companions/favorites`);
        FavoriteCompanion.create(req.body).save()
            .then(companion => {
                res.status(201).send(companion);
            })
            .catch(err => {
                res.status(500).send(err);
            })
    })

router.route("/companions/:id")
    .get((req, res) => {
        console.log(`GET /companions/${req.params.id}`);
        Companion.findById(req.params.id)
            .then(companion => {
                res.status(200).send(companion);
            })
            .catch(err => {
                res.status(404).send("companion not found");
            })
    })
    .patch((req, res) => {
        console.log(`PATCH /companions/${req.params.id}`);
        Companion.findByIdAndUpdate(req.params.id, req.body)
            .then(companion => {
                Companion.findById(req.params.id)
                    .then(updatedComp => {
                        res.status(200).send(updatedComp);
                    })
                    .catch(err => {
                        res.status(500).send(err);
                    })
            })
            .catch(err => {
                res.status(500).send(err);
            })
    })
    .delete((req, res) => {
        console.log(`DELETE /companions/${req.params.id}`);
        Companion.findByIdAndDelete(req.params.id)
            .then(companion => {
                res.status(200).send();
            })
            .catch(err => {
                res.status(404).send("companion not found");
            })
    });

router.route("/companions/:id/doctors")
    .get((req, res) => {
        console.log(`GET /companions/${req.params.id}/doctors`);
        Companion.findById(req.params.id)
            .then(companion => {
                Doctor.find({ '_id' : {$in : companion.doctors}})
                    .then(doctors => {
                        res.status(200).send(doctors);
                    })
                    .catch(err => {
                        res.status(404).send("not found");
                    })
            })
            .catch(err => {
                res.status(404).send("not found");
            })
    });

router.route("/companions/:id/friends")
    .get((req, res) => {
        console.log(`GET /companions/${req.params.id}/friends`);
        Companion.findById(req.params.id)
            .then(companions => {
                Companion.find({'seasons' : {$elemMatch : {$in: companions.seasons } }, "_id" : { $not : { $eq: req.params.id }}})
                    .then(friends => {
                        res.status(200).send(friends);
                    })
                    .catch(err => {
                        res.status(404).send("no friends");
                    })
            })
            .catch(err => {
                res.status(404).send("companion not found")
            })
    });

// optional:
router.route("/companions/favorites/:companion_id")
    .delete((req, res) => {
        console.log(`DELETE /companions/favorites/${req.params.companion_id}`);
        res.status(501).send();
    });

module.exports = router;