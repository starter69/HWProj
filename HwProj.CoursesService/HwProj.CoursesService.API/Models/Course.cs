﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.CoursesService.API.Models
{
    public class Course
    {
        [Key]
        public long Id { get; set; }
        public string Name { get; set; }
    }
}
