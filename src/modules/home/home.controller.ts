import express from "express";
import {Request, Response} from "express";
import IControllerBase from "@interfaces/IControllerBase.interface";

class HomeController implements IControllerBase{
    public path = "/";
    public router = express.Router();

    constructor() {
        this.initRoutes();
    }

    public initRoutes(): any {
        this.router.get('/', this.getIndex)
    }

    private getIndex = (req:Request, res:Response)=>{
        res.render('home/index');
    }
}

export default HomeController;