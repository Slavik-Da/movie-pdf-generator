import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Res,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('movies')
  async getPopularMovies(@Res() res: Response): Promise<void> {
    try {
      const pdf = await this.appService.getPopularMoviesPdf();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=popular_movies.pdf',
      );
      res.end(pdf);
    } catch (error) {
      throw new HttpException(
        'Error fetching movies',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('movies/:id')
  async getMoviesById(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const pdf = await this.appService.getMovieById(id);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=movie_${id}.pdf`,
      );
      res.end(pdf);
    } catch (error) {
      throw new HttpException(
        'Error fetching movies',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
