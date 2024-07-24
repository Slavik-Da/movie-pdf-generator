import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Res,
} from '@nestjs/common';
import { MoviesService } from './movies.service';
import { Response } from 'express';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  async getPopularMovies(@Res() res: Response): Promise<void> {
    try {
      const pdf = await this.moviesService.getPopularMoviesPdf();
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

  @Get('/:id')
  async getMoviesById(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const pdf = await this.moviesService.getMovieByIdPdf(id);
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
