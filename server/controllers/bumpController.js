import asyncHandler from "express-async-handler";
import connectDB from "../Database/connectDb.js";
import Bump from "../models/Bump.js";

// import { MongoClient } from "mongodb";
connectDB();

const getAllBumps = asyncHandler(async (req, res) => {
  const allBumps = await Bump.find().sort("-createdAt");
  res.send(allBumps);
});

const createBump = asyncHandler(async (req, res) => {
  const bump = await Bump.create(req.body);
  res.send(bump);
});

const deleteBumpp = asyncHandler(async (req, res) => {
  await Bump.findByIdAndDelete(req.params.bumpId);
  res.send("Successfull");
});

const updateBumpp = asyncHandler(async (req, res) => {
  const product = await Bump.findByIdAndUpdate(req?.params?.bumpId, req.body, {
    new: true,
  });
  res.send(product);
});

const getSingleBump = asyncHandler(async (req, res) => {
  const singleBump = await Bump.findById(req.params.bumpId);
  if (singleBump) {
    res.send(singleBump);
  } else {
    res.status(404);
    throw new Error("Bumps Not Found");
  }
});

export { getAllBumps, createBump, getSingleBump, deleteBumpp, updateBumpp };